import "./index.css";
import React, { useContext, useState } from "react";
import {
  ListGroupItem,
  Col,
  Row,
  Form,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import { useForm } from "react-hook-form";
import { AppContext } from "../../App";
import { setShippedEvent } from "../../reducer/clothing";

const OrderItem = ({
  clothId,
  name,
  ethPrice = "",
  usdPrice = 0,
  isSold = false,
  isMySale = false,
  trackingNumber: trackingNumberProp,
}) => {
  const [loading, setLoading] = useState(false);
  const { contract, accounts, dispatch } = useContext(AppContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { ref: refTrackingNumber, ...trackingNumber } = register(
    "trackingNumber",
    {
      required: "Required",
    }
  );
  const isWaitingShipment = !isMySale && isSold && !Boolean(trackingNumberProp);
  const isSoldAndMySale = isSold && isMySale;

  const onSubmit = async (values) => {
    setLoading(true);
    const { trackingNumber } = values;
    try {
      const response = await contract.methods
        .shipClothing(clothId, trackingNumber)
        .send({ from: accounts[0] });
      const event = response.events.LogClothShipped.returnValues.clothId;
      if (event) {
        dispatch(setShippedEvent(event));
      }
      reset();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <ListGroupItem>
      <Row className="align-items-center pt-1">
        <Col>
          <div className="d-flex">
            <h6>{name}</h6>
            <h6 className="text-primary ms-2">{ethPrice} eth</h6>
            <h6 className="text-muted ms-2">(${usdPrice.toFixed(2)} aprox.)</h6>
          </div>
        </Col>
        {Boolean(trackingNumberProp) && (
          <Col md="auto">
            <h6>
              Shipped:{" "}
              <span className="text-primary">{trackingNumberProp}</span>
            </h6>
          </Col>
        )}
        {isWaitingShipment && (
          <Col md="auto">
            <h6 className="text-warning">Waiting shipment</h6>
          </Col>
        )}
        {isSoldAndMySale && (
          <Col md="auto">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col>
                  <Input
                    id="trackingNumber"
                    placeholder="Tracking number"
                    type="text"
                    innerRef={refTrackingNumber}
                    invalid={errors.trackingNumber != null}
                    {...trackingNumber}
                  />
                </Col>
                <Col md="auto">
                  {loading && <Spinner color="primary">Loading...</Spinner>}
                  {!loading && (
                    <Button
                      color="primary"
                      className="flex-grow-1"
                      type="submit"
                    >
                      Ship clothes
                    </Button>
                  )}
                </Col>
              </Row>
            </Form>
          </Col>
        )}
      </Row>
    </ListGroupItem>
  );
};

export default OrderItem;
