import React from 'react';
import { SlidingPageContainer } from './SlidingPageContainer';

export const AnimatedPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SlidingPageContainer>{children}</SlidingPageContainer>;
};
