import React, { Fragment, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Header, Table, Icon, Button, Grid, Popup } from "semantic-ui-react";
import axios from "axios";
import Moment from "react-moment";
import { Link, useLocation } from "react-router-dom";
import _ from "lodash";
import HttpError from "components/HttpError";
import { renderMessage, visibilityMapper } from "utils/inputUtils";
import { TranslationStatus } from "./TranslationStatus";

/**
 * ManageServices is a component for seeing all services in the Author UI.
 * Content managers can change the ranking of services on this page, and click
 * in to edit a service.
 */
function ManageServices() {
  const { t } = useTranslation();
  const location = useLocation();
  const [updateMessage] = useState(_.get(location, "state.updateMessage", ""));
  const [dismissed, setDismissed] = useState(false);

  const [services, setServices] = useState({});
  const [order, setOrder] = useState([]);
  const [loadingError, setLoadingError] = useState(false);

  // Retrieves catalog data from API.
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get("/api/author/v1/services");
      const data = response.data;
      const services = data.services;
      // Store API date in state.
      setServices(services);

      // Store ranking of services in state.
      const orderedServices = Object.keys(services);
      orderedServices.sort((a, b) =>
        services[a].rank > services[b].rank ? 1 : -1
      );
      setOrder(orderedServices);
    } catch (err) {
      setLoadingError(true);
    }
  }, [setServices, setOrder, setLoadingError]);

  // Fetch data from the API upon page load.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Switches the ranking of two services represented by their keys.
  const swap = async (key1, key2) => {
    const rank1 = services[key1].rank;
    const rank2 = services[key2].rank;
    axios
      .post("/api/author/v1/services:rank", [
        { key: key1, rank: rank2 },
        { key: key2, rank: rank1 },
      ])
      .then(() => fetchData())
      .catch((err) => {
        // Just log the error; do not show an error message since the ranking
        // will not have changed on the frontend, so the user will naturally
        // try again.
        console.log(err);
      });
  };

  // Moves a service, represented by its key, to the highest ranking.
  const moveToTop = async (key) => {
    if (order.indexOf(key) === 0) {
      // If service to move to top is already ranked highest, return without
      // doing anything.
      return;
    }
    await axios
      .post("/api/author/v1/services:rank", [{ key: key, rank: 0 }])
      .then(() => fetchData())
      .catch((err) => {
        // Just log the error; do not show an error message since the ranking
        // will not have changed on the frontend, so the user will naturally
        // try again.
        console.log(err);
      });
  };

  // Moves up a service, represented by its key, in ranking.
  const moveUp = async (key) => {
    if (order.indexOf(key) === 0) {
      // If service to move up in the ranking is already ranked highest,
      // return without doing anything.
      return;
    }
    const swapKey = order[order.indexOf(key) - 1];
    await swap(key, swapKey);
  };

  // Moves down a service, represented by its key, in ranking.
  const moveDown = async (key) => {
    if (order.indexOf(key) === order.length - 1) {
      // If service to move down in the ranking is already ranked lowest,
      // return without doing anything.
      return;
    }
    const swapKey = order[order.indexOf(key) + 1];
    await swap(key, swapKey);
  };

  // Moves a service, represented by its key, to the lowest ranking.
  const moveToBottom = async (key) => {
    if (order.indexOf(key) === order.length - 1) {
      // If service to move to bottom is already ranked lowest, return without
      // doing anything.
      return;
    }
    await axios
      .post("/api/author/v1/services:rank", [{ key: key, rank: -1 }])
      .then(() => fetchData())
      .catch((err) => {
        // Just log the error; do not show an error message since the ranking
        // will not have changed on the frontend, so the user will naturally
        // try again.
        console.log(err);
      });
  };

  return (
    <Fragment>
      {loadingError && <HttpError errorMessage={t("httpError.generic")} />}
      {Object.keys(services).length > 0 && order.length > 0 && (
        <Fragment>
          {renderMessage(
            "" /* No error message */,
            updateMessage,
            dismissed,
            () => setDismissed(true)
          )}
          <Grid verticalAlign="middle">
            <Grid.Column width={13}>
              <Header as="h1">
                {t("manageServices.title", {
                  count: Object.keys(services).length,
                })}
              </Header>
            </Grid.Column>
            <Grid.Column width={3}>
              <Link to="/app/services/create">
                <Button primary fluid>
                  {t("manageServices.addService")}
                </Button>
              </Link>
            </Grid.Column>
          </Grid>
          <p>{t("manageServices.display")}</p>
          <Table selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={4}>
                  {t("manageServices.rank")}
                </Table.HeaderCell>
                <Table.HeaderCell width={5}>
                  {t("manageServices.name")}
                </Table.HeaderCell>
                <Table.HeaderCell width={2}>
                  {t("manageServices.modified")}
                </Table.HeaderCell>
                <Table.HeaderCell width={2}>
                  {t("manageServices.visibility")}
                </Table.HeaderCell>
                <Table.HeaderCell width={3}>
                  {t("manageServices.translations")}
                </Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {order.map((serviceKey, index) => {
                const disableUp = index === 0;
                const disableDown = index === order.length - 1;
                return (
                  <Table.Row key={serviceKey} selectable="true">
                    <Table.Cell>
                      <Popup
                        content={t("manageServices.moveToTop")}
                        trigger={
                          <Button
                            compact
                            disabled={disableUp}
                            size="tiny"
                            aria-label={t("manageServices.moveToTop")}
                            icon="angle double up"
                            onClick={() => moveToTop(serviceKey)}
                          />
                        }
                      />
                      <Popup
                        content={t("manageServices.moveUp")}
                        trigger={
                          <Button
                            compact
                            disabled={disableUp}
                            size="tiny"
                            aria-label={t("manageServices.moveUp")}
                            icon="angle up"
                            onClick={() => moveUp(serviceKey)}
                          />
                        }
                      />
                      <Popup
                        content={t("manageServices.moveDown")}
                        trigger={
                          <Button
                            compact
                            disabled={disableDown}
                            size="tiny"
                            aria-label={t("manageServices.moveDown")}
                            icon="angle down"
                            onClick={() => moveDown(serviceKey)}
                          />
                        }
                      />
                      <Popup
                        content={t("manageServices.moveToBottom")}
                        trigger={
                          <Button
                            compact
                            disabled={disableDown}
                            size="tiny"
                            aria-label={t("manageServices.moveToBottom")}
                            icon="angle double down"
                            onClick={() => moveToBottom(serviceKey)}
                          />
                        }
                      />
                    </Table.Cell>
                    {/* Author UI is only in English so use the English translations */}
                    <Table.Cell>
                      {services[serviceKey].resources.en.name}
                    </Table.Cell>
                    <Table.Cell>
                      <Moment format="MMM Do, YYYY">
                        {services[serviceKey].modified}
                      </Moment>
                    </Table.Cell>
                    <Table.Cell>
                      {t(
                        visibilityMapper[
                          services[serviceKey].enabled.toString()
                        ]
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <TranslationStatus service={services[serviceKey]} />
                    </Table.Cell>
                    <Table.Cell>
                      <a
                        aria-label={`edit-${serviceKey}`}
                        href={`/app/services/update/${serviceKey}`}
                      >
                        <Icon name="pencil" />
                      </a>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Fragment>
      )}
    </Fragment>
  );
}

export default ManageServices;
