import React, { useContext } from "react";
import Header from "../../components/Header";
import MainContent from "../../components/Main";
import { Col, ListGroup, Row } from "reactstrap";
import OrderItem from "../../components/OrderItem";
import { useGetMyOrders } from "../../hooks/clothContract";
import { AppContext } from "../../App";
import { getUSDPrice } from "../../utils/price";
import { State } from "../../constants";

const Orders = () => {
  const { web3, state, accounts } = useContext(AppContext);
  const { soldOrders, listedOrders, boughtOrders } = useGetMyOrders();
  const hasSoldOrders = soldOrders && soldOrders.length > 0;
  const hasListedOrders = listedOrders && listedOrders.length > 0;
  const hasBoughtOrders = boughtOrders && boughtOrders.length > 0;
  return (
    <div>
      <Header />
      <MainContent>
        <Row>
          <Col md="12">
            <h5 className="text-success">Sold</h5>
          </Col>
          <Col>
            {hasSoldOrders && (
              <ListGroup>
                {soldOrders.map((cloth) => {
                  const ethPrice = web3.utils.fromWei(cloth.initialPrice);
                  return (
                    <OrderItem
                      trackingNumber={cloth.trackingNumber}
                      clothId={cloth.clothId}
                      name={cloth.name}
                      key={cloth.clothId}
                      ethPrice={ethPrice}
                      usdPrice={getUSDPrice(ethPrice, state.ethInUSD)}
                      isSold={cloth.state === State.SOLD.toString()}
		      isMySale={cloth.seller === accounts[0]}
                    />
                  );
                })}
              </ListGroup>
            )}
            {!hasSoldOrders && <h6 className="text-muted">No orders yet...</h6>}
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md="12">
            <h5 className="text-primary">My clothes on sale</h5>
          </Col>
          <Col>
            {hasListedOrders && (
              <ListGroup>
                {listedOrders.map((cloth) => {
                  const ethPrice = web3.utils.fromWei(cloth.initialPrice);
                  return (
                    <OrderItem
                      trackingNumber={cloth.trackingNumber}
                      clothId={cloth.clothId}
                      name={cloth.name}
                      key={cloth.clothId}
                      ethPrice={ethPrice}
                      usdPrice={getUSDPrice(ethPrice, state.ethInUSD)}
                      isSold={cloth.state === State.SOLD.toString()}
                    />
                  );
                })}
              </ListGroup>
            )}
            {!hasListedOrders && (
              <h6 className="text-muted">No orders yet...</h6>
            )}
          </Col>
        </Row>
	<hr />
        <Row>
          <Col md="12">
            <h5 className="text-primary">My purchases</h5>
          </Col>
          <Col>
            {hasBoughtOrders && (
              <ListGroup>
                {boughtOrders.map((cloth) => {
                  const ethPrice = web3.utils.fromWei(cloth.initialPrice);
                  return (
                    <OrderItem
                      trackingNumber={cloth.trackingNumber}
                      clothId={cloth.clothId}
                      name={cloth.name}
                      key={cloth.clothId}
                      ethPrice={ethPrice}
                      usdPrice={getUSDPrice(ethPrice, state.ethInUSD)}
                      isSold={cloth.state === State.SOLD.toString()}
                    />
                  );
                })}
              </ListGroup>
            )}
            {!hasBoughtOrders && (
              <h6 className="text-muted">No orders yet...</h6>
            )}
          </Col>
        </Row>
      </MainContent>
    </div>
  );
};

export default Orders;
