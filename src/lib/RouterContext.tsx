// --- Custom Router ---

import { createContext, useCallback, useContext, useState } from "react";

type RoutePath =
  | "/"
  | "/history"
  | "/history/detail"
  | "/analytics"
  | "/settings";
const RouterContext = createContext<{
  currentPath: RoutePath;
  params: any;
  navigate: (path: RoutePath, params?: any) => void;
}>({ currentPath: "/", params: {}, navigate: () => {} });

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentPath, setCurrentPath] = useState<RoutePath>("/");
  const [params, setParams] = useState<any>({});

  const navigate = useCallback((path: RoutePath, newParams?: any) => {
    setCurrentPath(path);
    setParams(newParams || {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);
