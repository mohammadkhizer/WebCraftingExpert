
'use server';
import dbConnect from '@/lib/dbConnect';
import TeamMemberModel, { type ITeamMember } from '@/models/TeamMemberModel';
import type { TeamMember, CreateTeamMemberData } from '@/types';

function docToTeamMember(doc: ITeamMember | any): TeamMember {
  if (!doc) {
    console.error("[Service:Team] docToTeamMember received a null or undefined document.");
    throw new Error('Internal server error: Team member document is invalid.');
  }
  const plainDoc = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object' || !plainDoc._id) {
    console.error('[Service:Team] docToTeamMember: plainDoc is not a valid object or missing _id after toObject/spread.', plainDoc);
    throw new Error('Internal server error: Failed to process team member data.');
  }
  
  return {
    id: plainDoc._id.toString(),
    name: plainDoc.name,
    role: plainDoc.role,
    imageUrl: plainDoc.imageUrl,
    dataAiHint: plainDoc.dataAiHint || '',
    bio: plainDoc.bio,
    description: plainDoc.description || '',
    skills: Array.isArray(plainDoc.skills) ? plainDoc.skills.map(String) : [],
    qualifications: Array.isArray(plainDoc.qualifications) ? plainDoc.qualifications.map(String) : [],
    projectsInvolved: Array.isArray(plainDoc.projectsInvolved) ? plainDoc.projectsInvolved.map(String) : [],
    pastWork: Array.isArray(plainDoc.pastWork) ? plainDoc.pastWork.map(String) : [],
    socials: {
      linkedin: plainDoc.socials?.linkedin || undefined,
      twitter: plainDoc.socials?.twitter || undefined,
      github: plainDoc.socials?.github || undefined,
      instagram: plainDoc.socials?.instagram || undefined,
      cvUrl: plainDoc.socials?.cvUrl || undefined,
    },
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    await dbConnect();
    const membersDocs = await TeamMemberModel.find({}).sort({ createdAt: -1 }).lean();
    return membersDocs.map(docToTeamMember);
  } catch (error: any) {
    console.error('[Service:Team] Error in getTeamMembers:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch team members. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:Team] Invalid team member ID format for getTeamMemberById: ${id}`);
      return null;
    }
    const memberDoc = await TeamMemberModel.findById(id).lean();
    if (!memberDoc) return null;
    return docToTeamMember(memberDoc);
  } catch (error: any) {
    console.error(`[Service:Team] Error in getTeamMemberById for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch team member by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addTeamMember(memberData: CreateTeamMemberData): Promise<TeamMember> {
  try {
    await dbConnect();
    const newMemberDoc = new TeamMemberModel({
      ...memberData,
      imageUrl: memberData.imageUrl || `https://placehold.co/400x400.png?text=${encodeURIComponent(memberData.name.charAt(0))}`,
      dataAiHint: memberData.dataAiHint || 'person avatar',
      socials: { 
        linkedin: memberData.socials?.linkedin || undefined,
        twitter: memberData.socials?.twitter || undefined,
        github: memberData.socials?.github || undefined,
        instagram: memberData.socials?.instagram || undefined,
        cvUrl: memberData.socials?.cvUrl || undefined,
      }
    });
    const savedMember = await newMemberDoc.save();
    return docToTeamMember(savedMember);
  } catch (error: any) {
    console.error('[Service:Team] Error in addTeamMember:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add team member. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateTeamMember(id: string, updates: Partial<CreateTeamMemberData>): Promise<TeamMember | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating team member.');
    }

    const memberDoc = await TeamMemberModel.findById(id);
    if (!memberDoc) {
        console.warn(`[Service:Team] Team member with ID ${id} not found for update.`);
        throw new Error(`Team member with ID ${id} not found for update.`);
    }

    // Apply updates
    if (updates.name !== undefined) memberDoc.name = updates.name;
    if (updates.role !== undefined) memberDoc.role = updates.role;
    if (updates.imageUrl !== undefined) memberDoc.imageUrl = updates.imageUrl;
    if (updates.dataAiHint !== undefined) memberDoc.dataAiHint = updates.dataAiHint;
    if (updates.bio !== undefined) memberDoc.bio = updates.bio;
    if (updates.description !== undefined) memberDoc.description = updates.description;
    if (updates.skills !== undefined) memberDoc.skills = updates.skills;
    if (updates.qualifications !== undefined) memberDoc.qualifications = updates.qualifications;
    if (updates.projectsInvolved !== undefined) memberDoc.projectsInvolved = updates.projectsInvolved;
    if (updates.pastWork !== undefined) memberDoc.pastWork = updates.pastWork;

    if (updates.socials) {
      memberDoc.socials = {
        linkedin: updates.socials.linkedin || undefined,
        twitter: updates.socials.twitter || undefined,
        github: updates.socials.github || undefined,
        instagram: updates.socials.instagram || undefined,
        cvUrl: updates.socials.cvUrl || undefined,
      };
    } else if (updates.hasOwnProperty('socials') && updates.socials === null) {
        memberDoc.socials = undefined;
    }
    
    const savedDoc = await memberDoc.save();
    return docToTeamMember(savedDoc);
  } catch (error: any) {
    console.error(`[Service:Team] Error in updateTeamMember for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update team member. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteTeamMember(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return { success: false, error: 'Invalid ID format for deleting team member.'};
    }
    const result = await TeamMemberModel.findByIdAndDelete(id);
    if (!result) {
        console.warn(`[Service:Team] Team member with ID ${id} not found for deletion.`);
        return { success: false, error: `Team member with ID ${id} not found for deletion.`};
    }
    return { success: true, message: "Team member deleted successfully."};
  } catch (error: any) {
    console.error(`[Service:Team] Error in deleteTeamMember for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to delete team member. Original: ${error.message}. Check server logs for details.`);
  }
}
