import React, { useCallback, useContext, useState } from "react";
import {
  Form,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import { useForm } from "react-hook-form";
import { setLogListEvent } from "../../reducer/clothing";
import { AppContext } from "../../App";

const NewClothItemForSaleForm = () => {
  const [loading, setLoading] = useState(false);
  const [priceInUSD, setPriceInUSD] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { contract, dispatch, accounts, web3, state } = useContext(AppContext);
  const { ref: refName, ...clothName } = register("clothName", {
    required: "Required",
  });
  const { ref: refPrice, ...clothInitialPrice } = register(
    "clothInitialPrice",
    {
      required: "Required",
    }
  );
  const { ref: refBrand, ...clothBrand } = register("clothBrand", {
    required: "Required",
  });
  const { ref: refRecommendedAge, ...clothRecommendedAge } = register(
    "clothRecommendedAge",
    { required: "Required" }
  );
  const { ref: refSize, ...clothSize } = register("clothSize", {
    required: "Required",
  });
  const { ref: refDescription, ...clothDescription } = register(
    "clothDescription",
    { required: "Required" }
  );

  console.log(state.ethInUSD);

  const onSubmit = async (data) => {
    setLoading(true);
    const {
      clothName,
      clothInitialPrice,
      clothBrand,
      clothRecommendedAge,
      clothSize,
      clothDescription,
    } = data;
    try {
      const response = await contract.methods
        .listClothingOnSell(
          clothName,
          web3.utils.toWei(clothInitialPrice),
          clothDescription,
          clothBrand,
          clothRecommendedAge,
          clothSize
        )
        .send({ from: accounts[0] });
      const addedClothId =
        response.events.LogListClothingForSale.returnValues.clothCounter;
      dispatch(setLogListEvent(addedClothId));
      reset();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const onChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (!value) {
	setPriceInUSD("0");
	return;
      }
      const price = Number(value) * state.ethInUSD;
      if (price) {
        setPriceInUSD(price.toFixed(2));
      }
    },
    [state.ethInUSD]
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col md="4">
          <FormGroup>
            <Label for="clothName">Name</Label>
            <Input
              id="clothName"
              placeholder="Longsleeves tshirt"
              type="text"
              innerRef={refName}
              {...clothName}
            />
            {errors.clothName && (
              <small className="text-danger">{errors.clothName.message}</small>
            )}
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="clothInitialPrice">
              Price (eth){" "}
              <small className="text-muted">(${priceInUSD} aprox.)</small>
            </Label>
            <Input
              id="clothInitialPrice"
              placeholder="0.014"
              type="text"
              innerRef={refPrice}
              {...clothInitialPrice}
              onChange={onChange}
            />
            {errors.clothInitialPrice && (
              <small className="text-danger">
                {errors.clothInitialPrice.message}
              </small>
            )}
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="clothBrand">Brand</Label>
            <Input
              id="clothBrand"
              placeholder="Benetton"
              type="text"
              innerRef={refBrand}
              {...clothBrand}
            />
            {errors.clothBrand && (
              <small className="text-danger">{errors.clothBrand.message}</small>
            )}
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="clothRecommendedAge">Recommended age</Label>
            <Input
              id="clothRecommendedAge"
              placeholder="2-4 years"
              type="text"
              innerRef={refRecommendedAge}
              {...clothRecommendedAge}
            />
            {errors.clothRecommendedAge && (
              <small className="text-danger">
                {errors.clothRecommendedAge.message}
              </small>
            )}
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label for="clothSize">Size</Label>
            <Input
              id="clothSize"
              type="select"
              innerRef={refSize}
              {...clothSize}
            >
              <option value="0">Small</option>
              <option value="1">Medium</option>
              <option value="2">Large</option>
              <option value="3">XLarge</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md="12">
          <FormGroup>
            <Label for="clothDescription">Description</Label>
            <Input
              id="clothDescription"
              type="textarea"
              innerRef={refDescription}
              {...clothDescription}
            />
            {errors.clothDescription && (
              <small className="text-danger">
                {errors.clothDescription.message}
              </small>
            )}
          </FormGroup>
        </Col>
      </Row>
      {loading && <Spinner color="primary">Loading...</Spinner>}
      {!loading && (
        <Button color="primary" type="submit">
          List clothing for sale
        </Button>
      )}
    </Form>
  );
};

export default NewClothItemForSaleForm;
