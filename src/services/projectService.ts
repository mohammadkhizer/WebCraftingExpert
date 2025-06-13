
'use server';
import dbConnect from '@/lib/dbConnect';
import ProjectModel, { type IProject } from '@/models/ProjectModel';
import type { Project, CreateProjectData } from '@/types';

function docToProject(doc: IProject | any): Project {
  if (!doc) {
    console.error("[Service:Project] docToProject received a null or undefined document.");
    throw new Error('Internal server error: Project document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:Project] docToProject: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process project data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-project-id'),
    title: plainDoc.title || 'Untitled Project',
    description: plainDoc.description || 'No description available.',
    longDescription: plainDoc.longDescription || "",
    imageUrl: plainDoc.imageUrl || 'https://placehold.co/600x400.png',
    dataAiHint: plainDoc.dataAiHint || "",
    tags: Array.isArray(plainDoc.tags) ? plainDoc.tags : [],
    liveUrl: plainDoc.liveUrl || "",
    repoUrl: plainDoc.repoUrl || "",
    client: plainDoc.client || "",
    date: plainDoc.date ? new Date(plainDoc.date).toISOString().split('T')[0] : undefined,
    technologies: Array.isArray(plainDoc.technologies) ? plainDoc.technologies : [],
    status: plainDoc.status || "Planning",
    developerName: plainDoc.developerName, // This is required, so no default
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  try {
    await dbConnect();
    const projectsDocs = await ProjectModel.find({}).sort({ createdAt: -1 }).lean();
    return projectsDocs.map(docToProject);
  } catch (error: any) {
    console.error('[Service:Project] Error in getProjects:', error);
    throw new Error(`Failed to fetch projects. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        console.warn(`[Service:Project] Invalid project ID format for getProjectById: ${id}`);
        return null;
    }
    const projectDoc = await ProjectModel.findById(id).lean();
    if (!projectDoc) return null;
    return docToProject(projectDoc);
  } catch (error: any) {
    console.error(`[Service:Project] Error in getProjectById for ID ${id}:`, error);
    throw new Error(`Failed to fetch project by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addProject(projectData: CreateProjectData): Promise<Project> {
  try {
    await dbConnect();
    const newProjectDoc = new ProjectModel({
      ...projectData,
      date: projectData.date ? new Date(projectData.date) : undefined, // Ensure date is stored as Date object
      imageUrl: projectData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(projectData.title.charAt(0))}`,
      dataAiHint: projectData.dataAiHint || 'project abstract',
    });
    const savedProject = await newProjectDoc.save();
    return docToProject(savedProject);
  } catch (error: any) {
    console.error('[Service:Project] Error in addProject:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add project. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateProject(id: string, updates: Partial<CreateProjectData>): Promise<Project | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid ID format for updating project.');
    }
    const updateData: any = { ...updates }; // updatedAt handled by Mongoose
    if (updates.date === '') {
      updateData.date = undefined; // Unset the date if an empty string is passed
    } else if (updates.date) {
      updateData.date = new Date(updates.date); // Convert string to Date object
    }

    const updatedProjectDoc = await ProjectModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedProjectDoc) {
      console.warn(`[Service:Project] Project with ID ${id} not found for update.`);
      throw new Error(`Project with ID ${id} not found for update.`);
    }
    return docToProject(updatedProjectDoc);
  } catch (error: any) {
    console.error(`[Service:Project] Error in updateProject for ID ${id}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update project. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteProject(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return { success: false, error: 'Invalid ID format for deleting project.'};
    }
    const result = await ProjectModel.findByIdAndDelete(id);
    if (!result) {
        console.warn(`[Service:Project] Project with ID ${id} not found for deletion.`);
        return { success: false, error: `Project with ID ${id} not found for deletion.`};
    }
    return { success: true, message: "Project deleted successfully."};
  } catch (error: any) {
    console.error(`[Service:Project] Error in deleteProject for ID ${id}:`, error);
    throw new Error(`Failed to delete project. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteManyProjects(ids: string[]): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (!ids || ids.length === 0) {
    return { success: false, deletedCount: 0, error: "No project IDs provided for deletion." };
  }
  try {
    await dbConnect();
    for (const id of ids) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error(`Invalid project ID format in batch delete: ${id}.`);
      }
    }
    const result = await ProjectModel.deleteMany({ _id: { $in: ids } });
     if (result.deletedCount === 0 && ids.length > 0) {
        console.warn('[Service:Project] deleteManyProjects: No projects found matching the provided IDs for deletion.');
    }
    return { success: true, deletedCount: result.deletedCount || 0 };
  } catch (error: any) {
    console.error('[Service:Project] Error in deleteManyProjects:', error);
    throw new Error(`Failed to delete projects. Original: ${error.message}. Check server logs for details.`);
  }
}
