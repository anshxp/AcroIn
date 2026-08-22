import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import {
  studentAPI,
  facultyAPI,
  projectAPI,
  internshipAPI,
  competitionAPI,
  certificateAPI,
  postAPI,
  chatAPI,
  notificationAPI,
  opportunityAPI,
  skillAPI,
  interestAPI,
} from '../services/apiClient';
import type {
  Student,
  Faculty,
  Project,
  Internship,
  Competition,
  Certificate,
  StudentSkill,
} from '../types';

// ─── Profile Hooks ───────────────────────────────────────────────────

export const useStudentProfile = (identifier?: string) => {
  return useQuery({
    queryKey: ['student-profile', identifier],
    queryFn: () => studentAPI.getProfile(identifier!),
    enabled: !!identifier,
  });
};

export const useFacultyProfile = (enabled = true) => {
  return useQuery({
    queryKey: ['faculty-profile'],
    queryFn: () => facultyAPI.getProfile(),
    enabled,
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentAPI.updateProfile(id, data),
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-profile', variables.id] });
      if (user && updated?.name) {
        void setUser({ ...user, name: updated.name });
      }
    },
  });
};

export const useUpdateFacultyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Faculty>) => facultyAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-profile'] });
    },
  });
};

// ─── Project Hooks ───────────────────────────────────────────────────

export const useProjects = (studentId?: string) => {
  return useQuery({
    queryKey: ['projects', studentId],
    queryFn: () => projectAPI.getByStudent(studentId!),
    enabled: !!studentId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>) =>
      projectAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// ─── Internship Hooks ────────────────────────────────────────────────

export const useInternships = (studentId?: string) => {
  return useQuery({
    queryKey: ['internships', studentId],
    queryFn: () => internshipAPI.getByStudent(studentId!),
    enabled: !!studentId,
  });
};

export const useCreateInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => internshipAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useUpdateInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Internship> }) =>
      internshipAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useDeleteInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => internshipAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

// ─── Competition Hooks ───────────────────────────────────────────────

export const useCompetitions = (studentId?: string) => {
  return useQuery({
    queryKey: ['competitions', studentId],
    queryFn: () => competitionAPI.getByStudent(studentId!),
    enabled: !!studentId,
  });
};

export const useCreateCompetition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => competitionAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
};

export const useUpdateCompetition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Competition> }) =>
      competitionAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
};

export const useDeleteCompetition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
};

// ─── Certificate Hooks ───────────────────────────────────────────────

export const useCertificates = (studentId?: string) => {
  return useQuery({
    queryKey: ['certificates', studentId],
    queryFn: () => certificateAPI.getByStudent(studentId!),
    enabled: !!studentId,
  });
};

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => certificateAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Certificate> }) =>
      certificateAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => certificateAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

// ─── Skills Hooks ────────────────────────────────────────────────────

export const useSkills = (studentId?: string) => {
  return useQuery({
    queryKey: ['skills', studentId],
    queryFn: () => skillAPI.getByStudent(studentId!),
    enabled: !!studentId,
  });
};

export const useAddSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, skill }: { studentId: string; skill: Omit<StudentSkill, '_id'> }) =>
      skillAPI.addSkill(studentId, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      skillId,
      skill,
    }: {
      studentId: string;
      skillId: string;
      skill: Omit<StudentSkill, '_id'>;
    }) => skillAPI.updateSkill(studentId, skillId, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

// ─── Post / Feed Hooks ───────────────────────────────────────────────

const POSTS_PAGE_SIZE = 20;

export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => postAPI.getPage(pageParam, POSTS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; images?: string[]; scope?: 'campus' | 'department' }) =>
      postAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postAPI.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postAPI.unlike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postAPI.addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// ─── Chat Hooks ──────────────────────────────────────────────────────

export const useChats = (userId?: string) => {
  return useQuery({
    queryKey: ['chats', userId],
    queryFn: () => chatAPI.getChats(userId!),
    enabled: !!userId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chatId,
      content,
      tag,
    }: {
      chatId: string;
      content: string;
      tag?: 'DOUBT' | 'GENERAL';
    }) => chatAPI.sendMessage(chatId, content, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

// ─── Notification Hooks ──────────────────────────────────────────────

export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationAPI.getByUser(userId!),
    enabled: !!userId,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// ─── Opportunity Hooks ───────────────────────────────────────────────

export const useOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: () => opportunityAPI.getAll(),
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => opportunityAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
};

// ─── Interest Hooks ──────────────────────────────────────────────────

export const useMarkInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opportunityId: string) => interestAPI.markInterest(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
};

export const useUnmarkInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opportunityId: string) => interestAPI.unmarkInterest(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
};
