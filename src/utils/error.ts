export const parseErrorMessage = (error: any) => {
  if (typeof error?.message === 'string') {
    return error.message;
  }
  return '';
};