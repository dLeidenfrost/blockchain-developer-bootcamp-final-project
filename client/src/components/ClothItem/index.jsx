import "./index.css";
import React, { useContext, useState } from "react";
import { State } from "../../constants";
import {
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Spinner,
} from "reactstrap";
import { AppContext } from "../../App";
import { setLogBought } from "../../reducer/clothing";

const ClothItem = ({
  id,
  name,
  description,
  price,
  recommendedAge,
  brand,
  listedByMe,
  state,
}) => {
  const [loading, setLoading] = useState(false);
  const { accounts, contract, dispatch, web3 } = useContext(AppContext);
  const isSold = state === State.SOLD.toString();
  const isListed = state === State.LISTED.toString();
  const ethPrice = web3.utils.fromWei(price);

  const onBuy = async () => {
    setLoading(true);
    console.log("Buy this cloth", id, price, accounts[0]);
    try {
      const response = await contract.methods.buyClothingOnSell(id).send({
        from: accounts[0],
        value: parseInt(price),
      });
      console.log("response after buy: ", response);
      const event = response.events.LogClothingBought.returnValues.clothId;
      dispatch(setLogBought(event));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Card className="clothing-card mb-3">
      <CardImg
        alt="Card image cap"
        src="https://picsum.photos/318/180"
        top
        width="100%"
      />
      <CardBody className="d-flex flex-column">
        <CardTitle tag="h5">{name}</CardTitle>
        <h3 className="text-primary">{ethPrice} eth</h3>
        <h6 className="text-black-50">{brand}</h6>
        <CardText className="clothing-description">{description}</CardText>
        <div className="d-flex align-items-center mt-auto">
          {!loading && isSold && <h6 className="text-black-50">SOLD OUT</h6>}
          {listedByMe && <h6 className="text-success">Listed by me</h6>}
          {!listedByMe && (
            <React.Fragment>
              {loading && <Spinner color="primary" />}
              {!loading && isListed && (
                <Button color="primary" onClick={onBuy}>
                  Buy
                </Button>
              )}
            </React.Fragment>
          )}
          <h6 className="ms-auto text-black-50">{recommendedAge}</h6>
        </div>
      </CardBody>
    </Card>
  );
};

export default ClothItem;
