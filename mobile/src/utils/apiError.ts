export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const err = error as {
    message?: string;
    code?: string;
    response?: { data?: { message?: string }; status?: number };
  };

  if (err?.response?.data?.message) {
    return String(err.response.data.message);
  }

  if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
    return 'Cannot reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL is correct.';
  }

  if (err?.response?.status === 401) {
    return 'Session expired. Please log in again.';
  }

  if (err?.response?.status === 403) {
    return 'You do not have permission for this action.';
  }

  if (err?.message) {
    return err.message;
  }

  return fallback;
}

export const isCollegeEmail = (email: string): boolean =>
  /^[a-z0-9._%+-]+@acropolis\.in$/i.test(email.trim());
