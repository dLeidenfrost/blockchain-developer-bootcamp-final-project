import React from "react";
import { Container } from "reactstrap";

const MainContent = ({ children }) => {
  return <Container className="mt-4">{children}</Container>;
};

export default MainContent;
