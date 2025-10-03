// src/components/AdminDashboard.tsx
import React from 'react';
import { Tabs, Tab, Table, Button, Form, Modal } from 'react-bootstrap';
import { useGetProductsQuery, useCreateProductMutation, useDeleteProductMutation } from '../features/products/productAPI'; // useUpdateProductMutation
    
import { useGetCategoriesQuery } from '../features/categories/categoriesAPI';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../features/orders/ordersAPI';
import { useGetUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from '../features/admin/adminApi';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../app/store';

const AdminDashboard: React.FC = () => {
  const { data: productsData } = useGetProductsQuery({ page: 1, limit: 10 });
  const { data: categories } = useGetCategoriesQuery();
  const { data: ordersData } = useGetAllOrdersQuery({ page: 1, limit: 10 });
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 10 });
  const [createProduct] = useCreateProductMutation();
//   const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();
  // const user = useSelector((state: RootState) => state.auth?.user);

  const [showProductModal, setShowProductModal] = React.useState(false);
  const [productForm, setProductForm] = React.useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [] as File[],
  });

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    formData.append('stock', productForm.stock);
    productForm.images.forEach((image) => formData.append('images', image));

    try {
      await createProduct(formData).unwrap();
      setShowProductModal(false);
      setProductForm({ name: '', description: '', price: '', category: '', stock: '', images: [] });
    } catch (error) {
      console.error(error);
    }
  };

  // if (user?.role !== 'admin') {
  //   return <p>Access denied</p>;
  // }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <Tabs defaultActiveKey="products">
        <Tab eventKey="products" title="Products">
          <Button onClick={() => setShowProductModal(true)} className="mb-3">
            Add Product
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2</td>
                <td>43</td>
                <td>4</td>
                </tr>
  
            </tbody>
          </Table>

          <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Add Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleProductSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Images</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProductForm({
                        ...productForm,
                        images: Array.from(e.target.files || []),
                      })
                    }
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Save Product
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </Tab>
        <Tab eventKey="orders" title="Orders">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersData?.orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user.name}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td>
                    <Form.Select
                      onChange={(e) =>
                        updateOrderStatus({ id: order._id, status: e.target.value })
                      }
                      value={order.status}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="users" title="Users">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Form.Select
                      onChange={(e) =>
                        updateUserRole({ id: user._id, role: e.target.value })
                      }
                      value={user.role}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="seller">Seller</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;





// {productsData?.products.map((product) => (
//                 <tr key={product._id}>
//                   <td>{product.name}</td>
//                   <td>${product.price.toFixed(2)}</td>
//                   <td>{product.stock}</td>
//                   <td>
//                     <Button
//                       variant="warning"
//                       onClick={() => {
//                         /* Implement update logic */
//                       }}
                      
//                     >
//                       Edit
//                     </Button>{' '}
//                     <Button
//                       variant="danger"
//                       onClick={() => deleteProduct(product._id)}
//                     >
//                       Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))}