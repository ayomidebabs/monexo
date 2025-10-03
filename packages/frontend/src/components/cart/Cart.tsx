import React from 'react';
import { Button, ListGroup, Image, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllCartItems, updateQuantity, removeFromCart, clearCart } from '../../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/components/Cart.module.scss';
import type { RootState } from '../../app/store';

const Cart: React.FC = () => {
  const cartItems = useSelector(selectAllCartItems);
  const total = useSelector((state: RootState) => state.cart.total);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className={styles.cart}>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ListGroup>
            {cartItems.map((item) => (
              <ListGroup.Item key={item.id} className={styles.item}>
                <div className="d-flex align-items-center">
                  <Image src={item.image} thumbnail width={100} />
                  <div className="ms-3 flex-grow-1">
                    <h5>{item.name}</h5>
                    <p>${item.price.toFixed(2)} x {item.quantity}</p>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: parseInt(e.target.value),
                          })
                        )
                      }
                      style={{ width: '100px' }}
                    />
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Remove
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className={styles.total}>
            Total: ${total.toFixed(2)}
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/checkout')}
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </Button>
          <Button
            variant="secondary"
            onClick={() => dispatch(clearCart())}
            className="ms-2"
          >
            Clear Cart
          </Button>
        </>
      )}
    </div>
  );
};

export default Cart;