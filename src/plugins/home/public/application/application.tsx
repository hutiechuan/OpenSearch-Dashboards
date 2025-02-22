/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { i18n } from '@osd/i18n';
import { ScopedHistory, CoreStart, MountPoint } from 'opensearch-dashboards/public';
import { OpenSearchDashboardsContextProvider } from '../../../opensearch_dashboards_react/public';
import { NavigationPublicPluginStart } from '../../../navigation/public';
// @ts-ignore
import { HomeApp, ImportSampleDataApp } from './components/home_app';
import { getServices } from './opensearch_dashboards_services';

import './index.scss';
import { ContentManagementPluginStart } from '../../../../plugins/content_management/public';
import { SearchUseCaseOverviewApp } from './components/usecase_overview/search_use_case_app';

export const renderApp = async (
  element: HTMLElement,
  startServices: CoreStart & {
    navigation: NavigationPublicPluginStart;
    setHeaderActionMenu: (menuMount: MountPoint | undefined) => void;
  },
  history: ScopedHistory
) => {
  const homeTitle = i18n.translate('home.breadcrumbs.homeTitle', { defaultMessage: 'Home' });
  const { featureCatalogue, chrome } = getServices();
  const navLinks = chrome.navLinks.getAll();

  // all the directories could be get in "start" phase of plugin after all of the legacy plugins will be moved to a NP
  const directories = featureCatalogue.get();

  // Filters solutions by available nav links
  const solutions = featureCatalogue
    .getSolutions()
    .filter(({ id }) => navLinks.find(({ category, hidden }) => !hidden && category?.id === id));

  chrome.setBreadcrumbs([{ text: homeTitle }]);

  // dispatch synthetic hash change event to update hash history objects
  // this is necessary because hash updates triggered by using popState won't trigger this event naturally.
  // This must be called before the app is mounted to avoid call this after the redirect to default app logic kicks in
  const unlisten = history.listen((location) => {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });

  render(
    <OpenSearchDashboardsContextProvider services={startServices}>
      <HomeApp directories={directories} solutions={solutions} />
    </OpenSearchDashboardsContextProvider>,
    element
  );

  return () => {
    unmountComponentAtNode(element);
    unlisten();
  };
};

export const renderImportSampleDataApp = async (
  element: HTMLElement,
  startServices: CoreStart & {
    navigation: NavigationPublicPluginStart;
    setHeaderActionMenu: (menuMount: MountPoint | undefined) => void;
  }
) => {
  render(
    <OpenSearchDashboardsContextProvider services={startServices}>
      <ImportSampleDataApp />
    </OpenSearchDashboardsContextProvider>,
    element
  );

  return () => {
    unmountComponentAtNode(element);
  };
};

export const renderSearchUseCaseOverviewApp = async (
  element: HTMLElement,
  coreStart: CoreStart,
  contentManagementStart: ContentManagementPluginStart,
  navigation: NavigationPublicPluginStart
) => {
  render(
    <OpenSearchDashboardsContextProvider services={{ ...coreStart }}>
      <SearchUseCaseOverviewApp
        contentManagement={contentManagementStart}
        navigation={navigation}
      />
    </OpenSearchDashboardsContextProvider>,
    element
  );

  return () => {
    unmountComponentAtNode(element);
  };
};
