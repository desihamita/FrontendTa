import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/partials/Breadcrumb'
import axios from 'axios'
import Constants from '../../Constants'
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal';
import Loader from '../../components/partials/miniComponent/Loader'
import NoDataFound from '../../components/partials/miniComponent/NoDataFound'
import Pagination from 'react-js-pagination'

const ProductAttributes = () => {
  const navigate = useNavigate()
  const [input, setInput] = useState({ name: '', status: 1 });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [attributes, setAttributes] = useState([]);

  const [itemsCountPerPage, setItemsCountPerPage] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(1);
  const [startFrom, setStartFrom] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [modalTitle, setModalTitle] = useState('Add');
  const [isEditModal, setIsEditModal] = useState(false);

  const getAttributes = () => {
    setIsLoading(true);
    axios.get(`${Constants.BASE_URL}/attribute`).then(res => {
      setIsLoading(false);
      setAttributes(res.data.data)
      setItemsCountPerPage(res.data.meta.per_page);
      setStartFrom(res.data.meta.from);
      setTotalItemsCount(res.data.meta.total);
      setActivePage(res.data.meta.current_page);
    })
  }

  const handleInput = (e) => setInput(prevState => ({...prevState, [e.target.name] : e.target.value}));

  const handleAttributeCreate = (e) => {
    e.preventDefault();
    setIsLoading(true);
    axios.post(`${Constants.BASE_URL}/attribute`, input).then(res => {
        setIsLoading(false);
        Swal.fire({
            position: "top-end",
            icon: res.data.cls,
            title: res.data.msg,
            showConfirmButton: false,
            toast: true,
            timer: 1500
        });
        setErrors([]);
        setInput({ name: '', status: 1 });
        setModalShow(false);
        getAttributes();
        navigate('/product-attribute');
    }).catch(errors => {
        setIsLoading(false);
        if (errors.response && errors.response.status === 422) {
            setErrors(errors.response.data.errors);
        }
    });
  };

  const handleModalShow = (attribute = undefined) => {
    setInput({status: 1})
    if(attribute !== undefined) {
      setModalTitle('Update')
      setIsEditModal(true)
      setInput({status : attribute.original_status, name: attribute.name, id: attribute.id})
    } else {
      setIsEditModal(false)
      setModalTitle('Add')
    }
    setErrors([]);
    setModalShow(true)
  }

  const handleAttributeUpdate = (id) => {
    setIsLoading(true);
    axios.put(`${Constants.BASE_URL}/attribute/${id}`, input).then(res => {
        setIsLoading(false);
        Swal.fire({
            position: "top-end",
            icon: res.data.cls,
            title: res.data.msg,
            showConfirmButton: false,
            toast: true,
            timer: 1500
        });
        setErrors([]);
        setInput({ name: '', status: 1 });
        setModalShow(false);
        getAttributes();
        navigate('/product-attribute');
    }).catch(errors => {
        setIsLoading(false);
        if (errors.response && errors.response.status === 422) {
            setErrors(errors.response.data.errors);
        }
    });
  };

  const handleAttributeDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Product Attribute will be deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${Constants.BASE_URL}/attribute/${id}`).then(res => {
          setIsLoading(false)
          Swal.fire({
            position: "top-end",
            icon: res.data.cls,
            title: res.data.msg,
            showConfirmButton: false,
            toast: true,
            timer: 1500
          });
          getAttributes(activePage);
        });
      }
    });
  }

  useEffect(() => {
    getAttributes()
  }, [])

  return (
    <div className='content-wrapper'>
      <section className="content-header">
        <Breadcrumb title="Product Attributes" breadcrumb="Product" />
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card card-outline card-warning">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <button onClick={() => handleModalShow()} className="btn btn-primary mr-2">Add</button>
                  </div>
                </div>
                <div className="card-body">
                {isLoading ? <Loader/> : 
                  <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>SL</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Created By</th>
                          <th>Date Time</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                      {attributes.length > 0 ? attributes.map((attribute, index) => (
                            <tr key={index}>
                              <td>{startFrom + index}</td>
                              <td>{attribute.name}</td>
                              <td>{attribute.status}</td>
                              <td>{attribute.created_by}</td>
                              <td>
                                <p className="mb-0">
                                  <small>Created : {attribute.created_at}</small>
                                </p>
                                <p className="text-success">
                                  <small>Updated : {attribute.updated_at}</small>
                                </p>
                              </td>
                              <td className='m-1'>
                                <button onClick={() => handleModalShow(attribute)} className='btn btn-warning btn-sm my-1 mx-1'><i className="fas fa-solid fa-edit"></i></button>
                                
                                <button onClick={() => handleAttributeDelete(attribute.id)} className='btn btn-danger btn-sm my-1'><i className="fas fa-solid fa-trash"></i></button>
                              </td>
                            </tr>
                          )) : <NoDataFound/> }
                        </tbody>
                    </table>
                  </div>
                }
                </div>
                {/* Pagination */}
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <div className="data_tables_info">
                    Showing {startFrom} to {startFrom + attributes.length - 1} of {totalItemsCount} entries
                  </div>
                  <nav className="pagination-sm ml-auto">
                    <Pagination
                      activePage={activePage}
                      itemsCountPerPage={itemsCountPerPage}
                      totalItemsCount={totalItemsCount}
                      pageRangeDisplayed={10}
                      onChange={getAttributes}
                      nextPageText={'Next'}
                      prevPageText={'Previous'}
                      itemClass="page-item"
                      linkClass="page-link"
                    />
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal Add Product Attribute */}
        <Modal
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={modalShow}
          onHide={() => setModalShow(false)}
        >
          <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                {modalTitle} Product Attribute
              </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label>Name</label>
              <input 
                  type="text" 
                  name="name"
                  value={input.name}
                  onChange={handleInput} 
                  className={errors.name !== undefined ? 'form-control is-invalid ' : 'form-control'}
                  placeholder="Enter Product Attribute Name" 
              />
              {errors.name !== undefined && (
                  <div className="invalid-feedback">
                  {errors.name[0]}
                  </div>
              )}
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                  name='status'
                  value={input.status}
                  onChange={handleInput}
                  className={errors.status !== undefined ? 'form-control select2 is-invalid ' : 'form-control'}
                  placeholder="Select Product Attribute Status"
                >
                  <option value="" disabled>Select Attribute Status</option>
                  <option value={1}>Active</option>
                  <option value={2}>Inactive</option>
              </select>
              {errors.status && (
                <div className="invalid-feedback">
                  {errors.status[0]}
                </div>
              )}
            </div>
            <div className="modal-footer justify-content-between">
              <button className="btn btn-warning" onClick={isEditModal ? () => handleAttributeUpdate(input.id) : handleAttributeCreate } dangerouslySetInnerHTML={{__html: isLoading ? '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Loading...' : `${modalTitle} Attribute` }}/>
            </div>
          </Modal.Body>
        </Modal>
      </section>
    </div>
  )
}

export default ProductAttributes