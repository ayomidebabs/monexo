import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  children?: React.ReactNode;
}

const ScrollToTop: React.FC<Props> = ({ children }) => {
  const pathName = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathName]);
  return children;
};

export default ScrollToTop;
