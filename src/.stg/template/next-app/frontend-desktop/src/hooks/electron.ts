const useElectron = () => {
  return (global as any).electron as ElectronAccessor;
};
export default useElectron;