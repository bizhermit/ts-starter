const electronAccessor = () => {
  return (global as any).electron as ElectronAccessor;
};
export default electronAccessor;