import React from "react";
import { Container, Navbar, NavbarBrand } from "reactstrap";
// import Colors from '../../theme/colors.module.scss';

const Header = () => {
  return (
    <Container>
      <Navbar color="primary" expand="md" light>
        <NavbarBrand href="/">Prenditas</NavbarBrand>
      </Navbar>
    </Container>
  );
};

export default Header;
