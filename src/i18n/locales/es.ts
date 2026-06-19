import type { Messages } from '../types'
import { en } from './en'

export const es: Messages = {
  common: {
    complete: 'Completar',
    continue: 'Continuar',
    cancel: 'Cancelar',
    done: 'Listo',
    back: 'Atrás',
    or: 'O',
    close: 'Cerrar',
    optional: 'Opcional',
    soon: 'Pronto',
    reportIt: 'Reportarlo',
    skipTour: 'Omitir tour',
    next: 'Siguiente',
    getStarted: 'Comenzar',
    stepOf: 'Paso {current} de {total}',
    comingSoonAria: '{title} — {description}. Próximamente.',
    submit: 'Enviar',
  },
  header: {
    goBack: 'Volver',
    moreOptions: 'Más opciones',
    brandTaglineWeb: 'Remote Off · Web',
    menu: {
      replayTutorial: 'Repetir tutorial',
      reportIssue: 'Reportar problema',
      languageSettings: 'Configuración de idioma',
      signOut: 'Cerrar sesión',
    },
  },
  language: {
    title: 'Configuración de idioma',
    description: 'Elige el idioma para menús y etiquetas en esta aplicación.',
    done: 'Listo',
    names: {
      en: 'Inglés',
      es: 'Español',
      fr: 'Francés',
    },
    native: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
    },
  },
  exit: {
    logout: {
      title: '¿Cerrar sesión en Hertz?',
      body: 'Deberás iniciar sesión de nuevo para acceder a las apps de Hertz en este dispositivo.',
      continue: 'Permanecer conectado',
      leave: 'Cerrar sesión',
    },
    navigate: {
      title: '¿Salir de este flujo de trabajo?',
      body: 'Volverás a la pantalla de inicio. El temporizador de sesión se reiniciará al regresar.',
      continue: 'Seguir trabajando',
      leave: 'Salir',
    },
  },
  auth: {
    device: {
      tagline: 'Daytona',
      ownership: 'Dispositivo de Hertz · Solo uso autorizado',
      title: 'Inicia sesión para continuar',
      subtitle:
        'Usa tus credenciales SSO de Hertz. Este dispositivo usa autenticación basada en certificado para acceso seguro.',
      certificateTitle: 'Certificado del dispositivo verificado',
      certificateDesc: 'Perfil MDM activo · ID del dispositivo HRT-DYT-00482',
      signIn: 'Iniciar sesión con SSO',
      help: '¿Necesitas ayuda? Contacta a Soporte IT de Hertz al',
      helpPhone: '1-800-HERTZ-IT',
    },
    browser: {
      tagline: 'Remote Off · Web',
      title: 'Iniciar sesión con SSO',
      subtitle:
        'Usa tus credenciales corporativas de Hertz. Serás redirigido al proveedor de inicio de sesión único de tu organización.',
      continue: 'Continuar con SSO de Hertz',
      redirecting: 'Redirigiendo a SSO…',
      help: 'El acceso está limitado a miembros autorizados del equipo Hertz. Contacta a IT si no puedes iniciar sesión.',
    },
  },
  home: {
    srTitle: 'Flujos de trabajo de Hertz',
    signedInLabel: 'Usuario conectado',
    welcomeBack: 'Bienvenido de nuevo, {name}',
    groups: {
      turnaround: {
        label: 'Turnaround',
        description: 'Iniciar un flujo de trabajo del vehículo',
      },
    },
    workflows: {
      vsa: { title: 'VSA', description: 'Servicio y limpieza del vehículo' },
      transport: { title: 'Transporte', description: 'Mover vehículo al destino' },
      fuel: { title: 'Combustible', description: 'Desbloqueo remoto de bomba y repostaje' },
      'chase-van': { title: 'Chase Van', description: 'Recuperar van de persecución del cliente' },
      dispatcher: { title: 'Despachador', description: 'Coordinar despacho de flota' },
      inspection: { title: 'Inspección', description: 'Revisión del vehículo previa al alquiler' },
      keys: { title: 'Llaves', description: 'Entrega y devolución de llaves' },
    },
  },
  workflow: {
    sections: {
      movement: 'Movimiento',
      fuel: 'Combustible',
      stall: 'Puesto',
      cleaning: 'Limpieza',
    },
    status: {
      complete: 'Completado',
      notStarted: 'No iniciado',
      inProgress: 'En progreso',
      missing: 'Información faltante',
    },
    inProgress: {
      pump: 'Bomba',
      elapsed: 'Transcurrido',
      pickUpNozzle: 'Levanta la manguera',
      fuelingAtPump: 'Repostando en bomba',
      pickupRemainingAria: '{seconds} segundos restantes para levantar la manguera',
      pickupWaitingAria:
        'Ventana de levantamiento de manguera completada, esperando datos de la bomba',
      pickupActiveHint:
        'Tienes 60 segundos para comenzar a repostar. Los datos de la bomba pueden tardar un momento en actualizarse.',
      pickupWaitingHint: 'Los datos de la bomba pueden tardar un momento en sincronizarse.',
    },
    transport: {
      title: 'Transporte',
      subtitle: 'Isla de combustible',
    },
    vsa: {
      title: 'VSA',
      subtitle: 'Asesor de servicio del vehículo',
    },
    fuelOnly: {
      title: 'Combustible',
      subtitle: 'Repostaje remoto',
    },
    complete: {
      finishActiveSection:
        'Termina la sección activa del flujo de trabajo antes de completar.',
      finishMovement: 'Termina Movimiento para continuar.',
      finishMovementFuelOptional: 'Termina Movimiento para continuar. Combustible es opcional.',
      finishCleaningOrFuel: 'Termina Limpieza o Combustible para continuar.',
      finishCleaningOrFuelWithStall:
        'Termina Limpieza o Combustible para continuar. Otros servicios son opcionales.',
      finishSection: 'Termina una sección del flujo de trabajo para continuar.',
      enterOdometer: 'Ingresa la lectura del odómetro para continuar.',
      acknowledgeSection: 'Confirma {section} cuando estés listo.',
      sectionComplete: '{section} completado',
    },
  },
  progress: {
    selectLocation: 'Seleccionar ubicación',
    locationSelected: 'Ubicación seleccionada',
    selectLocationDesc: 'Busca una ubicación y selecciona una para continuar',
    selectStall: 'Seleccionar puesto',
    selectStallDesc: 'Ingresa el número de puesto y confirma',
    stallSelected: 'Puesto seleccionado',
    stallVerify: 'Puesto seleccionado - Verificar puesto',
    verifyPump: 'Verificar bomba',
    verifyPumpDesc: 'Escanea o ingresa el número de bomba para verificarla',
    unlockingPump: 'Desbloqueando bomba',
    startFueling: 'Iniciar repostaje',
    fuelingInProgress: 'Repostaje en curso',
    fuelingInProgressDesc: 'Registra los galones cuando termines de repostar',
    fuelingComplete: 'Repostaje completado',
    fuelingCompleteMissing: 'Repostaje completado - Información faltante',
    startCleaning: 'Iniciar limpieza',
    cleaningInProgress: 'Limpieza en curso',
    cleaningInProgressDesc: 'Tómate tu tiempo — toca finalizar cuando termines',
    cleaningComplete: 'Limpieza completada',
  },
  vehicle: {
    reportVehicle: 'Reportar vehículo',
    reportVehicleAria: 'Reportar vehículo {unitId} {name}',
    priority: {
      high: 'Prioridad alta',
      medium: 'Prioridad media',
      low: 'Prioridad baja',
    },
    status: {
      highPriority: 'Prioridad alta',
      active: 'Activo',
      complete: 'Completado',
      awaitingAction: 'Acción pendiente',
      onHold: 'En retención',
    },
    verifyStallBeforeTransport: 'Verifica el puesto antes de continuar el transporte',
    confirmTransportTo: 'Confirmar transporte a {location}',
    resolveFuelIssue: 'Resuelve el problema de combustible para continuar',
    verifyStallAvailability: 'Verifica la disponibilidad del puesto y reporta si es necesario',
    completeSection: 'Completar {section}',
    allStepsComplete: 'Todos los pasos requeridos completos — toca Completar para finalizar',
    cleaningCompleteOptional:
      'Limpieza completada — toca Completar para finalizar (combustible opcional)',
    fuelingCompleteOptional:
      'Repostaje completado — toca Completar para finalizar (limpieza opcional)',
    movementCompleteOptional:
      'Movimiento completado — toca Completar para finalizar (combustible opcional)',
    odometer: 'Odómetro',
    enterMileage: 'Ingresar kilometraje',
    verified: 'Verificado',
    milesUnit: 'mi',
    odometerHintVerified: 'Kilometraje verificado por telemática',
    enterReading: 'Ingresar lectura',
    onHold: 'En retención',
    holdWarning: 'Advertencia de retención: {code}',
    carPriority: 'Prioridad del vehículo',
    carTier: 'Nivel del vehículo',
    mileageIssues: {
      'telematics-unavailable': 'Telemática no disponible',
      'telematics-stale': 'Telemática desactualizada',
      'telematics-vin-mismatch': 'El VIN no coincide',
      'gasboy-unavailable': 'Gasboy no disponible',
      'gasboy-delayed': 'Gasboy retrasado',
      'rental-source': 'El kilometraje del alquiler puede estar desactualizado',
      'lookup-timeout': 'Tiempo de espera de consulta de kilometraje agotado',
      'source-mismatch': 'Las fuentes no coinciden',
    },
    odometerFloorError:
      'El kilometraje no puede ser menor que la última lectura de telemática ({floor} {unit}).',
    classes: {
      'EV MIDSIZE': 'EV mediano',
      '4WD SMALL 5 PASS SUV': 'SUV pequeño 4WD 5 pasajeros',
      'MIDSIZE 4 DOOR': 'Mediano 4 puertas',
      '4WD SMALL SUV': 'SUV pequeño 4WD',
    },
    holdMessages: {
      'STOP TNC CAR - OK TO SERVICE': 'DETENER AUTO TNC - OK PARA SERVICIO',
    },
  },
  movement: {
    modeGroup: 'Modo de movimiento',
    transport: 'Transporte',
    stall: 'Puesto',
    location: 'Ubicación',
    searchLocation: 'Buscar ubicación',
    stallNo: 'N.º de puesto',
    stallNumber: 'Número de puesto',
    stallNumberAria: 'Número de puesto',
    confirmStall: 'Confirmar puesto',
  },
  stall: {
    occupiedTitle: 'El puesto parece ocupado',
    occupiedDescription:
      'Si este puesto está disponible, toma una foto para reportar el problema.',
    photoRequirements: ['Número de puesto', 'Puesto completo y alrededores'],
    takePhoto: 'Tomar foto',
    issueReportedTitle: 'Problema reportado',
    issueReportedDescription:
      'Foto adjuntada correctamente. Puedes continuar cuando se verifique el puesto.',
    retakePhoto: 'Volver a tomar foto',
  },
  cleaning: {
    manualEntry: 'Entrada manual',
    manualEntryHint: 'Ingresa el número de bomba mostrado en la bomba',
    enterPumpNo: 'Ingresar n.º de bomba',
    selectAnotherPump: 'Selecciona otra bomba',
    verifyPump: 'Verificar bomba',
    backToScan: 'Volver al escaneo QR',
    atPump: 'Estás en la bomba {pump}',
    pumpConfirmed: 'Ubicación de bomba confirmada. Comienza la limpieza cuando estés listo.',
    startCleaning: 'Iniciar limpieza',
    finishCleaning: 'Finalizar limpieza',
    statusComplete: 'Completado',
    needMoreTime: '¿Necesitas más tiempo?',
    continueCleaningHint: 'Continúa la limpieza si deseas extender el temporizador.',
    continueCleaning: 'Continuar limpieza',
  },
  fuel: {
    atPump: 'Estás en la bomba {pump}',
    beginFueling: 'Comienza a repostar y registra los galones al terminar.',
    sessionActive: 'Sesión de repostaje activa',
    pumpUnavailable: 'Esta bomba no está disponible. Selecciona otra bomba.',
    tablePump: 'Bomba',
    tableStatus: 'Estado',
    tableTime: 'Hora',
    tableGal: 'Gal',
    finishFueling: 'Terminar repostaje',
    completeRemoteFueling: 'Completar repostaje remoto',
    reportIssue: 'Reportar problema',
    startFueling: 'Iniciar repostaje',
    statusComplete: 'Completado',
    statusIssue: 'Problema',
    gallonsPumped: 'Galones repostados',
    enterGallons: 'Ingresar galones dispensados',
    manualEntry: 'Entrada manual',
    manualEntryHint: 'Ingresa el número de bomba mostrado en la bomba',
    enterPumpNo: 'Ingresar n.º de bomba',
    cannotUnlock: 'Esta bomba no se puede desbloquear. Selecciona otra bomba.',
    verifyPump: 'Verificar bomba',
    unlockPump: 'Desbloquear bomba',
    scanPump: 'Escanear bomba',
    backToScan: 'Volver al escaneo',
    cancelUnlock: 'Cancelar desbloqueo',
    gallonsPending: 'Galones pendientes',
    gallonsPendingDesc:
      'Los datos de galones aún no estaban disponibles. Se agregarán automáticamente cuando llegue el reporte de la bomba.',
    needMoreFuel: '¿Necesitas más combustible?',
    needMoreFuelDesc: 'Reporta un problema para solicitar repostaje adicional.',
    reportAndContinue: 'Reportar y continuar',
    connectionLost: 'Conexión perdida',
    connectionLostMsg:
      'Se perdió la conexión con la bomba {pump}. Intenta levantar la manguera o usa desbloqueo en sitio.',
    onSiteUnlock: 'Desbloqueo en sitio',
    noResponse: 'Sin respuesta',
    noResponseMsg:
      'La bomba {pump} no respondió. Intenta levantar la manguera o reintenta el desbloqueo.',
    retryUnlockPump: 'Reintentar desbloqueo de bomba',
    unlockExpired: 'Desbloqueo expirado',
    unlockExpiredMsg: 'La ventana de 60 segundos para desbloquear la bomba {pump} ha terminado.',
    changePump: 'Cambiar bomba',
    pumpUnavailableTitle: 'Bomba no disponible',
    pumpUnavailableMsg:
      'Esta bomba no está disponible actualmente. Prueba otra bomba o ingresa manualmente.',
    chooseAnotherPump: 'Elegir otra bomba',
    pumpVerify: {
      default: {
        description: 'Escanea o ingresa el número de bomba para verificar la bomba',
        scanLabel: 'Escanear bomba',
        scanHint: 'Apunta al QR de tu bomba',
        manualEntryLabel: 'Ingresar número de bomba',
      },
      remote: {
        label: 'Desbloqueo remoto',
        description: 'Escanea o ingresa el número de bomba para desbloquear en esta app',
        scanLabel: 'Escanear bomba',
        scanHint: 'Apunta al QR de tu bomba',
        manualEntryLabel: 'Ingresar número de bomba',
      },
      onSite: {
        description: 'Después de desbloquear en el terminal',
        scanLabel: 'Escanear bomba',
        scanHint: 'Confirma que estás en la bomba correcta',
        manualEntryLabel: 'Ingresar número de bomba',
      },
    },
    unlockMode: {
      remote: {
        label: 'Desbloqueo remoto',
        text: 'La bomba se desbloquea en esta app cuando escaneas o ingresas el número.',
        switchLabel: 'Cambiar a desbloqueo en terminal en sitio',
      },
      onSite: {
        label: 'Desbloqueo en terminal en sitio',
        text: 'Desbloquea primero en el terminal de la bomba, luego escanea o ingresa el número aquí.',
        switchLabel: 'Cambiar a desbloqueo remoto',
      },
    },
    quickSelect: {
      label: 'Selección rápida',
      pump: 'Bomba {pump}',
      cleaningInProgress: 'Limpieza en curso en esta bomba',
      cleaningFinished: 'Limpieza finalizada en esta bomba',
      fuelingInProgress: 'Repostaje en curso en esta bomba',
      fuelingFinished: 'Repostaje finalizado en esta bomba',
    },
  },
  issue: {
    reportIssue: 'Reportar problema',
    reportVehicleIssue: 'Reportar problema del vehículo',
    reportFuellingIssue: 'Reportar problema de repostaje',
    whatsTheIssue: '¿Cuál es el problema?',
    vehicleIssue: 'Problema del vehículo',
    pumpIssue: 'Problema de bomba',
    vehicleIssueDesc: 'Daño, luz de advertencia u otro problema con un vehículo.',
    pumpIssueDuringSession: 'Reporta un problema de bomba durante esta sesión de repostaje.',
    chooseCategory: 'Elige si es un problema del vehículo o de la bomba.',
    workflowStaysOpen:
      'Tu flujo de trabajo permanece abierto detrás de este formulario. Toca fuera o Cancelar para volver.',
    fuellingStaysOpen:
      'Tu sesión de repostaje permanece abierta detrás de este formulario. Toca fuera o Cancelar para volver.',
    pumpIssues: ['La bomba dejó de repostar', 'La bomba está dañada', 'Otro'],
    pumpIssueTypes: [
      'La bomba no se desbloquea',
      'La bomba no inicia el repostaje',
      'La bomba dejó de repostar',
      'La bomba está dañada',
      'Otro',
    ],
    reportingFor:
      'Reportando para {unitId} · {name}. Tu flujo de trabajo permanece abierto detrás de este formulario.',
    pumpGeneralDesc:
      'La bomba no se desbloquea, dejó de repostar u otros problemas del dispensador.',
    vehicleReportFor:
      'Reporta un problema para {unitId} · {name}, o elige otro vehículo.',
    submitReport: 'Enviar reporte',
    scanVehicle: 'Escanear vehículo',
    scanVehicleHint:
      'Escanea el QR del auto, código de barras VIN o placa dentro del marco',
    searchVehiclesManually: 'Buscar vehículos manualmente',
    selectVehicle: 'Seleccionar vehículo',
    selectPump: 'Seleccionar bomba',
    scanVehicleShortHint: 'QR del auto, código VIN o placa',
    searchVehicles: 'Buscar vehículos',
    searchPlaceholder: 'Buscar por unidad o modelo',
    enterManually: 'Ingresar manualmente',
    additionalDetails: '¿Detalles adicionales?',
    detailsPlaceholder: 'Cuéntanos más (opcional)',
    reportingForVehicle: 'Reportando para {unitId} · {name}',
    issueReported: 'Problema reportado',
    issueReportedThanks:
      'Gracias por avisarnos. Investigaremos esto y te contactaremos pronto.',
  },
  tutorials: {
    home: {
      welcome: {
        title: 'Bienvenido a Daytona',
        body: 'Este recorrido rápido cubre lo esencial en la pantalla de inicio. Cada flujo de trabajo también tiene su propio tour la primera vez que lo abres.',
      },
      headerMenu: {
        title: 'Menú de la app',
        body: 'Toca el menú para opciones de sesión como reportar problemas y cerrar sesión.',
      },
      reportIssue: {
        title: 'Reportar un problema',
        body: 'Usa Reportar problema cuando algo falle durante un flujo de trabajo — problemas de bomba, conflictos de puesto u otros bloqueos.',
      },
      signOut: {
        title: 'Cerrar sesión',
        body: 'Cierra sesión cuando termines tu turno. Puedes repetir este tour de inicio desde el menú en cualquier momento.',
      },
      workflows: {
        title: 'Elige un flujo de trabajo',
        body: 'Los flujos de turnaround abren pantallas dedicadas. Se pueden agregar más acciones según las necesidades de tu ubicación.',
      },
      done: {
        title: 'Todo listo',
        body: 'Elige un flujo de trabajo para comenzar. Abre el menú más tarde si quieres repetir este tour.',
      },
    },
    transport: {
      welcome: {
        title: 'Flujo de transporte',
        body: 'Este tour recorre movimiento, fotos de puesto y repostaje para trabajos de transporte.',
      },
      vehicle: {
        title: 'Revisa tu vehículo',
        body: 'Confirma la unidad, clase y advertencias de retención. El kilometraje del odómetro se muestra en esta tarjeta.',
      },
      odometer: {
        title: 'Lectura del odómetro',
        body: 'El kilometraje confiable se completa automáticamente. Si los datos están desactualizados o no disponibles, ingresa la lectura actual aquí antes de completar.',
      },
      movement: {
        title: 'Registra el movimiento primero',
        body: 'Registra una ubicación de transporte o número de puesto. Completa el movimiento antes de que se desbloquee el repostaje.',
      },
      stallPhoto: {
        title: 'Reporta problemas de puesto con una foto',
        body: 'Si un puesto parece ocupado pero debería estar disponible, toca Tomar foto. Se abre la cámara para capturar el puesto y alrededores.',
      },
      fuel: {
        title: 'Repostar el vehículo',
        body: 'Desbloquea la bomba, escanea o ingresa el número de bomba y termina el repostaje.',
      },
      complete: {
        title: 'Finalizar la sesión',
        body: 'Cuando cada sección esté completa, toca Completar para cerrar este flujo de transporte.',
      },
      done: {
        title: 'Tour de transporte completado',
        body: 'Repite este tour desde el menú si necesitas un repaso.',
      },
    },
    vsa: {
      welcome: {
        title: 'Flujo VSA',
        body: 'Este tour cubre limpieza, combustible y puesto para trabajos de asesor de servicio del vehículo.',
      },
      vehicle: {
        title: 'Revisa tu vehículo',
        body: 'Revisa el vehículo asignado y el kilometraje del odómetro antes de iniciar el servicio.',
      },
      odometer: {
        title: 'Lectura del odómetro',
        body: 'El kilometraje verificado se captura automáticamente. Ingresa la lectura actual si se solicita antes de completar el flujo.',
      },
      cleaning: {
        title: 'Limpieza',
        body: 'Verifica la bomba, inicia la limpieza y marca la sección como completa al terminar.',
      },
      fuel: {
        title: 'Combustible',
        body: 'Escanea o ingresa la bomba, desbloquea remotamente o en sitio y registra el repostaje.',
      },
      stall: {
        title: 'Puesto',
        body: 'El puesto permanece bloqueado hasta que se complete el repostaje o la limpieza. Una vez desbloqueado, asigna un número de puesto y reporta problemas de ocupación con una foto si es necesario.',
      },
      complete: {
        title: 'Finalizar la sesión',
        body: 'Toca Completar cuando las secciones de limpieza, combustible y puesto estén listas.',
      },
      done: {
        title: 'Tour VSA completado',
        body: 'Repite este tour desde el menú si necesitas un repaso.',
      },
    },
  },
}

export const fr: Messages = en
