import type { Messages } from '../i18n/types'
import type { TutorialStep } from './tutorialSteps'

export function getHomeTutorialSteps(m: Messages['tutorials']['home']): TutorialStep[] {
  return [
    { id: 'welcome', title: m.welcome.title, body: m.welcome.body, placement: 'center' },
    {
      id: 'location',
      title: m.location.title,
      body: m.location.body,
      target: '[data-tutorial="header-location"]',
      placement: 'bottom',
    },
    {
      id: 'location-search',
      title: m.locationSearch.title,
      body: m.locationSearch.body,
      target: '[data-tutorial="location-search"]',
      openLocationPicker: true,
      placement: 'bottom',
      mobileCard: 'sheet',
    },
    {
      id: 'header-menu',
      title: m.headerMenu.title,
      body: m.headerMenu.body,
      target: '[data-tutorial="header-menu"]',
      placement: 'bottom',
    },
    {
      id: 'report-issue',
      title: m.reportIssue.title,
      body: m.reportIssue.body,
      target: '[data-tutorial="header-report-issue"]',
      openHeaderMenu: true,
      placement: 'bottom',
    },
    {
      id: 'sign-out',
      title: m.signOut.title,
      body: m.signOut.body,
      target: '[data-tutorial="header-sign-out"]',
      openHeaderMenu: true,
      placement: 'bottom',
    },
    {
      id: 'workflows',
      title: m.workflows.title,
      body: m.workflows.body,
      target: '[data-tutorial="workflows"]',
      placement: 'bottom',
      mobileCard: 'sheet',
    },
    { id: 'done', title: m.done.title, body: m.done.body, placement: 'center' },
  ]
}

export function getTransportTutorialSteps(m: Messages['tutorials']['transport']): TutorialStep[] {
  return [
    { id: 'welcome', title: m.welcome.title, body: m.welcome.body, placement: 'center' },
    {
      id: 'vehicle',
      title: m.vehicle.title,
      body: m.vehicle.body,
      target: '[data-tutorial="vehicle"]',
      placement: 'bottom',
    },
    {
      id: 'odometer',
      title: m.odometer.title,
      body: m.odometer.body,
      target: '[data-tutorial="vehicle-odometer"]',
      placement: 'bottom',
    },
    {
      id: 'movement',
      title: m.movement.title,
      body: m.movement.body,
      target: '[data-tutorial="movement"]',
      expandSection: 'movement',
      placement: 'bottom',
      mobileCard: 'top',
    },
    {
      id: 'stall-photo',
      title: m.stallPhoto.title,
      body: m.stallPhoto.body,
      preview: 'stall-photo',
      placement: 'center',
    },
    {
      id: 'fuel',
      title: m.fuel.title,
      body: m.fuel.body,
      target: '[data-tutorial="fuel"]',
      expandSection: 'fuel',
      placement: 'top',
      mobileCard: 'top',
    },
    {
      id: 'complete',
      title: m.complete.title,
      body: m.complete.body,
      target: '[data-tutorial="complete"]',
      placement: 'top',
      mobileCard: 'top',
    },
    { id: 'done', title: m.done.title, body: m.done.body, placement: 'center' },
  ]
}

export function getVsaTutorialSteps(m: Messages['tutorials']['vsa']): TutorialStep[] {
  return [
    { id: 'welcome', title: m.welcome.title, body: m.welcome.body, placement: 'center' },
    {
      id: 'vehicle',
      title: m.vehicle.title,
      body: m.vehicle.body,
      target: '[data-tutorial="vehicle"]',
      placement: 'bottom',
    },
    {
      id: 'odometer',
      title: m.odometer.title,
      body: m.odometer.body,
      target: '[data-tutorial="vehicle-odometer"]',
      placement: 'bottom',
    },
    {
      id: 'cleaning',
      title: m.cleaning.title,
      body: m.cleaning.body,
      target: '[data-tutorial="cleaning"]',
      expandSection: 'cleaning',
      placement: 'bottom',
      mobileCard: 'top',
    },
    {
      id: 'fuel',
      title: m.fuel.title,
      body: m.fuel.body,
      target: '[data-tutorial="fuel"]',
      expandSection: 'fuel',
      placement: 'bottom',
      mobileCard: 'top',
    },
    {
      id: 'stall',
      title: m.stall.title,
      body: m.stall.body,
      target: '[data-tutorial="stall"]',
      expandSection: 'stall',
      placement: 'top',
      mobileCard: 'top',
    },
    {
      id: 'complete',
      title: m.complete.title,
      body: m.complete.body,
      target: '[data-tutorial="complete"]',
      placement: 'top',
      mobileCard: 'top',
    },
    { id: 'done', title: m.done.title, body: m.done.body, placement: 'center' },
  ]
}