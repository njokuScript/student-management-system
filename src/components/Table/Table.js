import React, { Component } from 'react'
import TableFrame from '../TableFrame'
import PaginationBar from '../PaginationBar'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import './Table.scss'

class Table extends Component {

  constructor (props) {
    super(props)

    this.state = {
      deleteModalShow: false,
      editModalShow: false,
      addModalShow: false,
      form: {
        modal: {}
      }
    }

    this.setShowModal = this.setShowModal.bind(this)
    this.confirmDeleteRow = this.confirmDeleteRow.bind(this)
    this.confirmEditRow = this.confirmEditRow.bind(this)
    this.formEditContent = this.formEditContent.bind(this)
    this.handleChangeForm = this.handleChangeForm.bind(this)
  }

  reloadTable = () => {
    this.props.loadTable(this.src, this.config)
  }

  sliceTableView = () => {
    try {
      const props = this.props
      return props.data.slice(
        props.tableView.range[0],
        props.tableView.range[1]
      )
    } catch (e) {
      return []
    }
  }

  formEditContent = () => {
    const { header } = this.props.config

    let content = []
    for (let i = 0; i < header.length; i++) {
      const prop = header[i].prop
      if (prop === '_rid' || header[i].isDelete || header[i].isEdit) continue
      content.push(
        <div className='form-group row' key={i}>
          <label className='col-4 col-form-label'>{header[i].title}</label>
          <div className='col-8'>
            <input
              className='form-control'
              name={prop}
              value={this.state.form.modal ? (this.state.form.modal[prop] || '') : ''}
              onChange={(e) => this.handleChangeForm(e, prop)}
              />
          </div>
        </div>
      )
    }

    return content
  }

  handleChangeForm = (event, property) => {
    this.setState({
      form: {
        modal: {
          ...this.state.form.modal,
          [property]: event.target.value
        }
      }
    })
  }

  setShowModal = (modelName, status) => {
    this.setState({
      [modelName + 'Show']: status
    })
  }

  confirmDeleteRow = (resolve, reject) => {
    this.setShowModal('deleteModal', true)
    this._confirm = resolve
    this._reject = reject
  }

  confirmEditRow = (resolve, reject, oldData) => {
    this.setShowModal('editModal', true)
    this.setState({
      form: {
        modal: oldData
      }
    })
    this._confirm = () => resolve(this.state.form.modal)
    this._reject = reject
  }

  addRow = () => {
    this.setShowModal('addModal', true)
    this.setState({
      form: {
        modal: {}
      }
    })
    this._confirm = () => {
      // this.props.showLog('Adding data...')
      this.reloadTable()
    }
    this._reject = () => {}
  }

  componentWillMount () {
    const props = this.props
    const { config } = props

    config.pagination = config.pagination || {
      pageSize: config.pagination.pageSize || 10,
      paginationBarSize: config.pagination.paginationBarSize || 5
    }

    this.config = config
    this.src = {
      url: props.url
    }
  }

  componentDidMount () {
    this.reloadTable()
  }

  render () {
    const props = this.props
    let { tableView } = props
    const config = this.config

    tableView = tableView || {}

    return (
      <div>
        <Modal isOpen={this.state.editModalShow || this.state.addModalShow}>
          <ModalHeader>{this.state.editModalShow ? 'Edit' : 'Add'} data</ModalHeader>
          <ModalBody>
            {this.formEditContent()}
          </ModalBody>
          <ModalFooter>
            <div className='btn btn-primary' onClick={() => {
              if (this._confirm) this._confirm()
              this.setShowModal('editModal', false)
              this.setShowModal('addModal', false)
            }}>{this.state.editModalShow ? 'Edit' : 'Add'}</div>{' '}
            <div className='btn btn-secondary' onClick={() => {
              if (this._reject) this._reject()
              this.setShowModal('editModal', false)
              this.setShowModal('addModal', false)
            }}>Cancel</div>
          </ModalFooter>
        </Modal>
        <Modal isOpen={this.state.deleteModalShow}>
          <ModalHeader>Delete data</ModalHeader>
          <ModalBody>
            Are you sure to delete data.
          </ModalBody>
          <ModalFooter>
            <div className='btn btn-danger' onClick={() => {
              if (this._confirm) this._confirm()
              this.setShowModal('deleteModal', false)
            }}>Delete</div>{' '}
            <div className='btn btn-secondary' onClick={() => {
              if (this._reject) this._reject()
              this.setShowModal('deleteModal', false)
            }}>Cancel</div>
          </ModalFooter>
        </Modal>
        <div className='nav-table' style={{ marginBottom: 15 }}>
          <div
            className='btn btn-primary'
            onClick={() => this.setShowModal('editModal', true)}>
            Test Modal
          </div>
          <div
            className='btn btn-primary'
            onClick={this.addRow}>
            <i className='fa fa-plus' /> Add Data
          </div>
          <div
            className='btn btn-primary'
            onClick={this.reloadTable}>
            <i className='fa fa-refresh' /> Load Table
          </div>
        </div>
        {
          props.logMsg &&
          (<div className='alert alert-info'>
            {props.logMsg}
          </div>)
        }
        {
          props.errorMsg &&
          (<div className='alert alert-danger'>
            <strong>Oops!</strong> {props.errorMsg}
          </div>)
        }
        <TableFrame
          data={this.sliceTableView()}
          header={config.header}
          isLoading={props.isLoading || false}
          className='table table-bordered table-striped table-md'

          deleteRowFunc={this.props.deleteRow}
          updateRowFunc={this.props.updateRow}

          confirmDeleteRow={this.confirmDeleteRow}
          confirmEditRow={this.confirmEditRow}

          onError={this.props.onError}
          showLog={this.props.showLog}
          />
        <nav>
          {
            tableView.range &&
            <PaginationBar
              startPage={tableView.startPage}
              paginationBarSize={config.pagination.paginationBarSize}
              pageNo={tableView.pageNo}
              pageAll={tableView.pageAll}

              onChangePage={(no) => this.props.changePage(no, this.config)}
              onChangePageTab={(startPage) => this.props.changePageTab(startPage)}
              />
          }
        </nav>
      </div>
    )
  }
}

// Configuration Type
const configTypes = React.PropTypes.shape({
  header: React.PropTypes.arrayOf(React.PropTypes.shape({
    title: React.PropTypes.string.isRequired,
    prop: React.PropTypes.string.isRequired,
    formatter: React.PropTypes.func,
    isDelete: React.PropTypes.bool
  })).isRequired,
  pagination: React.PropTypes.shape({
    pageSize: React.PropTypes.number.isRequired,
    paginationBarSize: React.PropTypes.number.isRequired
  })
}).isRequired

Table.propTypes = {
  // derived from container
  loadTable: React.PropTypes.func.isRequired,
  changePage: React.PropTypes.func.isRequired,
  changePageTab: React.PropTypes.func.isRequired,
  deleteRow: React.PropTypes.func.isRequired,
  updateRow: React.PropTypes.func.isRequired,
  onError: React.PropTypes.func.isRequired,
  showLog: React.PropTypes.func.isRequired,
  data: React.PropTypes.array,
  isLoading: React.PropTypes.bool,
  errorMsg: React.PropTypes.string,

  config: configTypes,
  id: React.PropTypes.string.isRequired,
  url: React.PropTypes.string.isRequired
}

export default Table
