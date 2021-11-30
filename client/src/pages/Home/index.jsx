import React, { useContext } from "react";
import { Col, Row } from "reactstrap";
import { AppContext } from "../../App";
import ClothItem from "../../components/ClothItem";
import Header from "../../components/Header";
import MainContent from "../../components/Main";
import NewClothItemForSaleForm from "../../components/NewClothItemForSaleForm";
import { useGetClothing } from "../../hooks/clothContract";

const Home = () => {
  const { accounts } = useContext(AppContext);
  const data = useGetClothing();
  const hasData = data && data.length > 0;

  return (
    <React.Fragment>
      <Header />
      <MainContent>
        <Row>
          <Col>
            <p className="text-black mb-0">
              Exchange some second hand clothes of your little ones, maybe
              someone might have a use for them!
            </p>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <NewClothItemForSaleForm />
          </Col>
        </Row>
        <hr />
        <Row>
          {hasData &&
            data.map((cloth) => {
              const listedByMe = cloth.seller === accounts[0];
              return (
                <Col md="4" key={cloth.clothId}>
                  <ClothItem
                    id={cloth.clothId}
                    state={cloth.state}
                    name={cloth.name}
                    description={cloth.description}
                    price={cloth.initialPrice}
                    brand={cloth.brand}
                    recommendedAge={cloth.recommendedAge}
                    listedByMe={listedByMe}
                  />
                </Col>
              );
            })}
          {!hasData && (
            <Col>
              <h6 className="text-black-50">Nothing here yet...</h6>
            </Col>
          )}
        </Row>
      </MainContent>
    </React.Fragment>
  );
};

export default Home;
