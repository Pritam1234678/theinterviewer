import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },
  register: async (fullName: string, email: string, password: string) => {
    const response = await api.post("/api/auth/register", {
      fullName,
      email,
      password,
    });
    return response.data;
  },
  googleLogin: async (idToken: string) => {
    const response = await api.post("/api/auth/google/login", { idToken });
    return response.data;
  },
  updateProfile: async (data: { fullName?: string; email?: string }) => {
    // Note: ensure backend supports this endpoint
    const response = await api.put("/api/auth/profile", data);
    return response.data;
  },
};

// Resume API
export interface ResumeAnalysisData {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  formatFeedback: string;
  contentFeedback: string;
  improvementTips: string;
  overallSummary: string;
}

export const resumeAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/resumes/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  analyze: async (resumeId: number) => {
    const response = await api.post(`/api/resumes/${resumeId}/analyze`);
    return response.data;
  },
  getMyResumes: async () => {
    const response = await api.get("/api/resumes");
    return response.data;
  },
};

// Interview API
export const interviewAPI = {
  createProfile: async (data: {
    resumeId: number;
    currentRole: string;
    experienceYears: number;
    difficultyLevel: string;
    techStack: string[];
    recentProjects?: string;
  }) => {
    const response = await api.post("/api/interviews/profile", data);
    return response.data;
  },
  startInterview: async (profileId: number) => {
    const response = await api.post(`/api/interviews/start?profileId=${profileId}`);
    return response.data;
  },
  getQuestion: async (sessionId: number) => {
    const response = await api.get(`/api/interviews/${sessionId}/question`);
    return response.data;
  },
  submitAnswer: async (sessionId: number, questionId: number, answer: string) => {
    const response = await api.post(`/api/interviews/${sessionId}/answer`, {
      questionId,
      userAnswer: answer,
    });
    return response.data;
  },
  completeInterview: async (sessionId: number) => {
    const response = await api.post(`/api/interviews/${sessionId}/complete`);
    return response.data;
  },
  abandonInterview: async (sessionId: number) => {
    const response = await api.post(`/api/interviews/${sessionId}/abandon`);
    return response.data;
  },
  getReport: async (sessionId: number) => {
    const response = await api.get(`/api/interviews/${sessionId}/report`);
    return response.data;
  },
};

// Dashboard API
export interface DashboardSummaryResponse {
  fullName: string;
  totalInterviews: number;
  latestInterviewScore: number | null; // Already supports decimals
  resumeAtsScore: number | null;
  resumeScoreTrend?: string;
  interviewScoreTrend?: string;
}

export interface UserRankResponse {
  rank: number;
  totalUsers: number;
  userScore: number;
}

export const dashboardAPI = {
  getSummary: async () => {
    const response = await api.get("/api/dashboard");
    return response.data;
  },
  getRank: async () => {
    const response = await api.get("/api/dashboard/rank");
    return response.data;
  },
};

// History API
export interface ResumeHistoryItem {
  id: number;
  fileName: string;
  analyzedAt: string;
  atsScore: number;
  summary: string;
}

export interface InterviewHistoryItem {
  id: number;
  role: string;
  date: string;
  averageScore: number;
  roundsCompleted: number;
  feedbackStatus: string;
}

export const historyAPI = {
  getResumeHistory: async () => {
    const response = await api.get("/api/history/resumes");
    return response.data;
  },
  getInterviewHistory: async () => {
    const response = await api.get("/api/history/interviews");
    return response.data;
  },
};
// Support API
export const supportAPI = {
  submitQuery: async (data: { name: string; email: string; query: string }) => {
    const response = await api.post("/api/support", data);
    return response.data;
  },
};
