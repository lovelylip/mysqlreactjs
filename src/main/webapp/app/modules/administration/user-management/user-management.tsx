import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Table, Row, Badge } from 'reactstrap';
import {Translate, TextFormat, JhiPagination, JhiItemCount, getSortState, translate} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { ITEMS_PER_PAGE } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { getUsers, updateUser } from './user-management.reducer';
import { IRootState } from 'app/shared/reducers';
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export interface IUserManagementProps extends StateProps, DispatchProps, RouteComponentProps<{}> {}

export const UserManagement = (props: IUserManagementProps) => {
  const [pagination, setPagination] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE), props.location.search)
  );

  useEffect(() => {
    props.getUsers(pagination.activePage - 1, pagination.itemsPerPage, `${pagination.sort},${pagination.order}`);
    const endURL = `?page=${pagination.activePage}&sort=${pagination.sort},${pagination.order}`;
    if (props.location.search !== endURL) {
      props.history.push(`${props.location.pathname}${endURL}`);
    }
  }, [pagination.activePage, pagination.order, pagination.sort]);

  useEffect(() => {
    const params = new URLSearchParams(props.location.search);
    const page = params.get('page');
    const sort = params.get('sort');
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPagination({
        ...pagination,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [props.location.search]);

  const sort = p => () =>
    setPagination({
      ...pagination,
      order: pagination.order === 'asc' ? 'desc' : 'asc',
      sort: p,
    });

  const handlePagination = currentPage =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

  const toggleActive = user => () =>
    props.updateUser({
      ...user,
      activated: !user.activated,
    });

  const { users, account, match, totalItems } = props;

  const categories = [{name: 'Accounting', key: 'A'}, {name: 'Marketing', key: 'M'}, {name: 'Production', key: 'P'}, {name: 'Research', key: 'R'}];
  const [checked, setChecked] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(categories.slice(1,3));

  const onCategoryChange = (e) => {
    const _selectedCategories = [...selectedCategories];

    if (e.checked) {
      _selectedCategories.push(e.value);
    }
    else {
      for (let i = 0; i < _selectedCategories.length; i++) {
        const selectedCategory = _selectedCategories[i];

        if (selectedCategory.key === e.value.key) {
          _selectedCategories.splice(i, 1);
          break;
        }
      }
    }

    setSelectedCategories(_selectedCategories);
  }


  const onCityChange = (e) => {
    const selectedCities = [...cities];

    if (e.checked)
      selectedCities.push(e.value);
    else
      selectedCities.splice(selectedCities.indexOf(e.value), 1);

    setCities(selectedCities);
  }

  const activatedBody = (user) => {
    return user.activated ? (
      <Button color="success" onClick={toggleActive(user)}>
        <Translate contentKey="userManagement.activated">Activated</Translate>
      </Button>
    ) : (
      <Button color="danger" onClick={toggleActive(user)}>
        <Translate contentKey="userManagement.deactivated">Deactivated</Translate>
      </Button>
    );
  }

  const idBody = (user) => {
    return <Button tag={Link} to={`${match.url}/${user.login}`} color="link" size="sm">
      {user.id}
    </Button>;
  }

  const authoritiesBody = (user, i) => {
    return user.authorities
      ? user.authorities.map((authority, j) => (
        <div key={`user-auth-${i.rowIndex}-${j}`}>
          <Badge color="info">{authority}</Badge>
        </div>
      ))
      : null;
  }

  return (
    <div>
      <div className="card">
        <h5>Basic</h5>
        <div className="p-field-checkbox">
          <Checkbox inputId="binary" checked={checked} onChange={e => setChecked(e.checked)} />
          <label htmlFor="binary">{checked ? 'true' : 'false'}</label>
        </div>

        <h5>Multiple</h5>
        <div className="p-field-checkbox">
          <Checkbox inputId="city1" name="city" value="Chicago" onChange={onCityChange} checked={cities.includes('Chicago')} />
          <label htmlFor="city1">Chicago</label>
        </div>
        <div className="p-field-checkbox">
          <Checkbox inputId="city2" name="city" value="Los Angeles" onChange={onCityChange} checked={cities.includes('Los Angeles')} />
          <label htmlFor="city2">Los Angeles</label>
        </div>
        <div className="p-field-checkbox">
          <Checkbox inputId="city3" name="city" value="New York" onChange={onCityChange} checked={cities.includes('New York')} />
          <label htmlFor="city3">New York</label>
        </div>
        <div className="p-field-checkbox">
          <Checkbox inputId="city4" name="city" value="San Francisco" onChange={onCityChange} checked={cities.includes('San Francisco')} />
          <label htmlFor="city4">San Francisco</label>
        </div>

        <h5>Dynamic Values, Preselection, Value Binding and Disabled Option</h5>
        {
          categories.map((category) => {
            return (
              <div key={category.key} className="p-field-checkbox">
                <Checkbox inputId={category.key} name="category" value={category} onChange={onCategoryChange} checked={selectedCategories.some((item) => item.key === category.key)} disabled={category.key === 'R'} />
                <label htmlFor={category.key}>{category.name}</label>
              </div>
            )
          })
        }
      </div>
      <div className="card">
        <DataTable value={this.props.users} paginator totalRecords={props.totalItems} rows={pagination.itemsPerPage}
                   lazy first={pagination.activePage} onPage={handlePagination} loading={false}>
          <Column field="id" body={idBody} header={translate('global.field.id')} sortable></Column>
          <Column field="login" header={translate('userManagement.login')} sortable></Column>
          <Column field="email" header={translate('userManagement.email')} sortable></Column>
          <Column field="activated" body={activatedBody}></Column>
          <Column field="langKey" header={translate('userManagement.langKey')} sortable></Column>
          <Column field="profiles" body={authoritiesBody} header={translate('userManagement.profiles')}></Column>
          <Column field="createdDate" header={translate('userManagement.createdDate')} sortable></Column>
          <Column field="lastModifiedBy" header={translate('userManagement.lastModifiedBy')} sortable></Column>
          <Column field="lastModifiedDate" header={translate('userManagement.lastModifiedDate')} sortable></Column>
          <Column></Column>
        </DataTable>
      </div>
      <h2 id="user-management-page-heading">
        <Translate contentKey="userManagement.home.title">Users</Translate>
        <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity">
          <FontAwesomeIcon icon="plus" /> <Translate contentKey="userManagement.home.createLabel">Create a new user</Translate>
        </Link>
      </h2>
      <Table responsive striped>
        <thead>
          <tr>
            <th className="hand" onClick={sort('id')}>
              <Translate contentKey="global.field.id">ID</Translate>
              <FontAwesomeIcon icon="sort" />
            </th>
            <th className="hand" onClick={sort('login')}>
              <Translate contentKey="userManagement.login">Login</Translate>
              <FontAwesomeIcon icon="sort" />
            </th>
            <th className="hand" onClick={sort('email')}>
              <Translate contentKey="userManagement.email">Email</Translate>
              <FontAwesomeIcon icon="sort" />
            </th>
            <th />
            <th className="hand" onClick={sort('langKey')}>
              <Translate contentKey="userManagement.langKey">Lang Key</Translate>
              <FontAwesomeIcon icon="sort" />
            </th>
            <th>
              <Translate contentKey="userManagement.profiles">Profiles</Translate>
            </th>
            <th className="hand" onClick={sort('createdDate')}>
              <Translate contentKey="userManagement.createdDate">Created Date</Translate>
              <FontAwesomeIcon icon="sort" />
            </th>
            <th className="hand" onClick={sort('lastModifiedBy')}>
              <Translate contentKey="userManagement.lastModifiedBy">Last Modified By</Translate>
              <FontAwesomeIcon icon="sort" />
            </th>
            <th id="modified-date-sort" className="hand" onClick={sort('lastModifiedDate')}>
              <Translate contentKey="userManagement.lastModifiedDate">Last Modified Date</Translate>
              <FontAwesomeIcon icon="sort" />
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr id={user.login} key={`user-${i}`}>
              <td>
                <Button tag={Link} to={`${match.url}/${user.login}`} color="link" size="sm">
                  {user.id}
                </Button>
              </td>
              <td>{user.login}</td>
              <td>{user.email}</td>
              <td>
                {user.activated ? (
                  <Button color="success" onClick={toggleActive(user)}>
                    <Translate contentKey="userManagement.activated">Activated</Translate>
                  </Button>
                ) : (
                  <Button color="danger" onClick={toggleActive(user)}>
                    <Translate contentKey="userManagement.deactivated">Deactivated</Translate>
                  </Button>
                )}
              </td>
              <td>{user.langKey}</td>
              <td>
                {user.authorities
                  ? user.authorities.map((authority, j) => (
                      <div key={`user-auth-${i}-${j}`}>
                        <Badge color="info">{authority}</Badge>
                      </div>
                    ))
                  : null}
              </td>
              <td>
                {user.createdDate ? <TextFormat value={user.createdDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid /> : null}
              </td>
              <td>{user.lastModifiedBy}</td>
              <td>
                {user.lastModifiedDate ? (
                  <TextFormat value={user.lastModifiedDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid />
                ) : null}
              </td>
              <td className="text-right">
                <div className="btn-group flex-btn-group-container">
                  <Button tag={Link} to={`${match.url}/${user.login}`} color="info" size="sm">
                    <FontAwesomeIcon icon="eye" />{' '}
                    <span className="d-none d-md-inline">
                      <Translate contentKey="entity.action.view">View</Translate>
                    </span>
                  </Button>
                  <Button tag={Link} to={`${match.url}/${user.login}/edit`} color="primary" size="sm">
                    <FontAwesomeIcon icon="pencil-alt" />{' '}
                    <span className="d-none d-md-inline">
                      <Translate contentKey="entity.action.edit">Edit</Translate>
                    </span>
                  </Button>
                  <Button
                    tag={Link}
                    to={`${match.url}/${user.login}/delete`}
                    color="danger"
                    size="sm"
                    disabled={account.login === user.login}
                  >
                    <FontAwesomeIcon icon="trash" />{' '}
                    <span className="d-none d-md-inline">
                      <Translate contentKey="entity.action.delete">Delete</Translate>
                    </span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {props.totalItems ? (
        <div className={users && users.length > 0 ? '' : 'd-none'}>
          <Row className="justify-content-center">
            <JhiItemCount page={pagination.activePage} total={totalItems} itemsPerPage={pagination.itemsPerPage} i18nEnabled />
          </Row>
          <Row className="justify-content-center">
            <JhiPagination
              activePage={pagination.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={props.totalItems}
            />
          </Row>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  users: storeState.userManagement.users,
  totalItems: storeState.userManagement.totalItems,
  account: storeState.authentication.account,
});

const mapDispatchToProps = { getUsers, updateUser };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(UserManagement);
