export const singleton = <S>(factory: () => S) => {
  let instance: S | null = null;

  return {
    get: () => {
      if (!instance) {
        instance = factory();
      }
      return instance;
    },
  };
};
