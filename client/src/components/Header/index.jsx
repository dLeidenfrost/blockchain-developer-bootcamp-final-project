import React from "react";
import {Link} from "react-router-dom";
import { Container, Navbar, NavbarBrand } from "reactstrap";
import {ROUTES} from "../../constants";
// import Colors from '../../theme/colors.module.scss';

const Header = () => {
  return (
    <Container>
      <Navbar color="primary" expand="md" light>
	<Link to={ROUTES.HOME} className="text-decoration-none">
	  <NavbarBrand tag="h3">Prenditas</NavbarBrand>
	</Link>
	<Link to={ROUTES.ORDERS} className="text-white">My orders</Link>
      </Navbar>
    </Container>
  );
};

export default Header;
