import { LanguageCode, TipoMovimiento } from '../types/freezer';

export interface Translations {
  appName: string;
  appSubtitle: string;

  // Nav
  navInventario: string;
  navMovimientos: string;
  navCategorias: string;
  navAjustes: string;

  // Header & Stats
  totalAlimentos: string;
  stockBajo: string;
  agotado: string;
  bajoStockBadge: string;
  buscarPlaceholder: string;
  sincronizar: string;
  nuevoProducto: string;
  nuevoProductoShort: string;
  todos: string;
  limpiarFiltros: string;

  // Empty states
  emptyFreezerTitle: string;
  emptyFreezerDesc: string;
  emptySearchTitle: string;
  emptySearchDesc: string;

  // Movimiento Modal (Retirar / Agregar)
  retirarTitulo: string;
  agregarTitulo: string;
  retirarProducto: string;
  agregarProducto: string;
  disponibleActual: string;
  cantidadRetirar: string;
  cantidadAgregar: string;
  todo: string;
  observacionLabel: string;
  opcional: string;
  obsPlaceholderRetirar: string;
  obsPlaceholderAgregar: string;
  cancelar: string;
  guardar: string;
  guardando: string;
  errorCantidadInvalida: string;
  errorRetirarMasDeDisponible: string;

  // Nuevo Producto Modal
  nuevoProductoTitulo: string;
  nuevoProductoSubtitulo: string;
  nombreProductoLabel: string;
  nombreProductoPlaceholder: string;
  categoriaLabel: string;
  elegirExistente: string;
  crearNueva: string;
  nuevaCatPlaceholder: string;
  unidadMedidaLabel: string;
  cantidadInicialLabel: string;
  alertaMinimoLabel: string;
  guardarProductoBtn: string;
  errorNombreVacio: string;
  errorNombreDuplicado: string;
  errorSaldoInvalido: string;
  errorMinimoInvalido: string;

  // Editar Producto Modal
  saldoActualLabel: string;
  tabDatos: string;
  tabAjuste: string;
  tabArchivar: string;
  guardarCambios: string;
  infoAjusteTitulo: string;
  infoAjusteDesc: string;
  saldoRegistradoActualmente: string;
  nuevoSaldoExactoLabel: string;
  motivoAjusteLabel: string;
  motivoAjustePlaceholder: string;
  registrarAjusteBtn: string;
  confirmarArchivarTitulo: string;
  confirmarArchivarDesc: string;
  siArchivarBtn: string;
  archivando: string;
  notaModificarSaldo: string;

  // Movimientos View
  movimientosTitulo: string;
  registrosEncontrados: string;
  registroEncontrado: string;
  filtrarAlimentoPlaceholder: string;
  filtroTodos: string;
  filtroEntradas: string;
  filtroSalidas: string;
  filtroAjustes: string;
  sinMovimientosTitulo: string;
  sinMovimientosDesc: string;
  sinMovimientosFiltroDesc: string;
  saldoMovimientoPrefix: string;

  // Categorias View
  categoriasTitulo: string;
  categoriasSubtitulo: string;
  nuevaCategoriaTitulo: string;
  nuevaCategoriaPlaceholder: string;
  crearCategoriaBtn: string;
  verCategoriaBtn: string;
  productosActivos: string;
  productoActivo: string;
  errorNombreCategoriaVacio: string;
  errorCategoriaExiste: string;
  categoriaCreadaExito: string;

  // Ajustes View
  ajustesTitulo: string;
  ajustesSubtitulo: string;
  idiomaSeccionTitulo: string;
  idiomaSeccionDesc: string;
  pinSeccionTitulo: string;
  pinSeccionDesc: string;
  bloquearBtn: string;
  cambiarPinLabel: string;
  nuevoPinPlaceholder: string;
  guardarPinBtn: string;
  pinActualLabel: string;
  pinActualizadoExito: string;
  pwaSeccionTitulo: string;
  pwaSeccionDesc: string;
  pwaDisponibilidadLabel: string;
  sincronizacionSeccionTitulo: string;
  sincronizacionSeccionDesc: string;
  sincronizarBtn: string;
  sincronizadoExito: string;

  // PIN Modal
  pinModalTitulo: string;
  pinModalDesc: string;
  pinInputLabel: string;
  pinInputPlaceholder: string;
  desbloquearBtn: string;
  recordarDispositivo: string;
  errorPinVacio: string;

  // Offline & Connectivity
  offlineAviso: string;
  errorConexionTitulo: string;
  reintentarConexion: string;
  cargandoTitulo: string;
  cargandoSubtitulo: string;

  // PWA Install
  instalarApp: string;
  instalarPWA: string;
  instalarIosTitulo: string;
  paso1IosTitulo: string;
  paso1IosDesc: string;
  paso2IosTitulo: string;
  paso2IosDesc: string;
  iosListoDesc: string;
  entendidoBtn: string;

  // Toast templates
  toastRetiradoExito: string;
  toastAgregadoExito: string;
  toastAjusteExito: string;
  toastProductoCreadoExito: string;
  toastProductoEditadoExito: string;
  toastProductoArchivadoExito: string;
  toastCategoriaCreadaExito: string;
}

export const translations: Record<LanguageCode, Translations> = {
  de: {
    appName: 'Mein Gefrierschrank',
    appSubtitle: 'Bestandsverwaltung',

    navInventario: 'Inventar',
    navMovimientos: 'Buchungen',
    navCategorias: 'Kategorien',
    navAjustes: 'Einstellungen',

    totalAlimentos: 'Lebensmittel gesamt',
    stockBajo: 'Knapper Bestand',
    agotado: 'Ausverkauft',
    bajoStockBadge: 'Niedrig',
    buscarPlaceholder: 'Hähnchenbrust, Brot, Fleisch suchen...',
    sincronizar: 'Mit Google Sheets synchronisieren',
    nuevoProducto: 'Neues Produkt',
    nuevoProductoShort: 'Neu',
    todos: 'Alle',
    limpiarFiltros: 'Filter zurücksetzen',

    emptyFreezerTitle: 'Dein Gefrierschrank ist leer. Füge dein erstes Produkt hinzu.',
    emptyFreezerDesc: 'Behalte den genauen Überblick über deine Tiefkühlwaren, Fleisch, Brot und Portionen.',
    emptySearchTitle: 'Keine Lebensmittel gefunden',
    emptySearchDesc: 'Kein Produkt entspricht den angewendeten Filtern.',

    retirarTitulo: 'Entnehmen',
    agregarTitulo: 'Hinzufügen',
    retirarProducto: 'Entnehmen',
    agregarProducto: 'Hinzufügen',
    disponibleActual: 'Aktuell verfügbar:',
    cantidadRetirar: 'Menge zum Entnehmen',
    cantidadAgregar: 'Menge zum Hinzufügen',
    todo: 'Alles',
    observacionLabel: 'Bemerkung',
    opcional: 'optional',
    obsPlaceholderRetirar: 'Z.B. Sonntagsessen',
    obsPlaceholderAgregar: 'Z.B. Einkauf beim Metzger',
    cancelar: 'Abbrechen',
    guardar: 'Speichern',
    guardando: 'Wird gespeichert...',
    errorCantidadInvalida: 'Bitte gib eine gültige Menge größer als 0 ein.',
    errorRetirarMasDeDisponible: 'Du kannst nicht mehr als den verfügbaren Bestand entnehmen',

    nuevoProductoTitulo: 'Neues Produkt',
    nuevoProductoSubtitulo: 'Lebensmittel zum Gefrierschrank hinzufügen',
    nombreProductoLabel: 'Produktname *',
    nombreProductoPlaceholder: 'Z.B. Hähnchenbrust, Baguette, Spinat',
    categoriaLabel: 'Kategorie *',
    elegirExistente: 'Bestehende wählen',
    crearNueva: '+ Neu erstellen',
    nuevaCatPlaceholder: 'Name der neuen Kategorie',
    unidadMedidaLabel: 'Maßeinheit',
    cantidadInicialLabel: 'Anfangsbestand',
    alertaMinimoLabel: 'Mindestbestand-Warnung',
    guardarProductoBtn: 'Produkt speichern',
    errorNombreVacio: 'Bitte gib den Produktnamen an.',
    errorNombreDuplicado: 'Es gibt bereits ein aktives Produkt namens',
    errorSaldoInvalido: 'Der Anfangsbestand darf nicht negativ oder ungültig sein.',
    errorMinimoInvalido: 'Der Mindestbestand darf nicht negativ sein.',

    saldoActualLabel: 'Aktueller Bestand:',
    tabDatos: 'Daten',
    tabAjuste: 'Bestand korrigieren',
    tabArchivar: 'Archivieren',
    guardarCambios: 'Änderungen speichern',
    infoAjusteTitulo: 'Tatsächliche Bestandsanpassung',
    infoAjusteDesc: 'Diese Aktion erfasst eine Buchung vom Typ BESTANDSKORREKTUR in Google Sheets mit dem neuen Gesamtbestand.',
    saldoRegistradoActualmente: 'Derzeit erfasster Bestand:',
    nuevoSaldoExactoLabel: 'Neuer genauer Bestand *',
    motivoAjusteLabel: 'Grund der Korrektur',
    motivoAjustePlaceholder: 'Z.B. Physische Zählung, Wiegung mit Waage',
    registrarAjusteBtn: 'Korrektur erfassen',
    confirmarArchivarTitulo: 'Möchtest du das Produkt archivieren?',
    confirmarArchivarDesc: 'Das Produkt wird nicht mehr in deiner aktiven Gefrierschrankliste angezeigt. Es wird weder physisch aus Google Sheets gelöscht noch wird der Buchungsverlauf entfernt.',
    siArchivarBtn: 'Ja, archivieren',
    archivando: 'Wird archiviert...',
    notaModificarSaldo: '* Um den Lagerbestand zu ändern, nutze den Reiter "Bestand korrigieren" oder die Schaltflächen [+] und [-] im Inventar.',

    movimientosTitulo: 'Buchungsverlauf',
    registrosEncontrados: 'Einträge gefunden',
    registroEncontrado: 'Eintrag gefunden',
    filtrarAlimentoPlaceholder: 'Nach Lebensmittel filtern...',
    filtroTodos: 'Alle',
    filtroEntradas: '⬇️ Zugänge',
    filtroSalidas: '⬆️ Entnahmen',
    filtroAjustes: '⚖️ Korrekturen',
    sinMovimientosTitulo: 'Keine Buchungen erfasst',
    sinMovimientosDesc: 'Einträge für Zugänge, Entnahmen und Korrekturen erscheinen hier.',
    sinMovimientosFiltroDesc: 'Versuche, die Suchfilter zu ändern oder zurückzusetzen.',
    saldoMovimientoPrefix: 'Bestand:',

    categoriasTitulo: 'Lebensmittelkategorien',
    categoriasSubtitulo: 'Organisiere deine Tiefkühlwaren nach Bereichen',
    nuevaCategoriaTitulo: 'Neue Kategorie',
    nuevaCategoriaPlaceholder: 'Z.B. Meeresfrüchte, Milchprodukte, Eis...',
    crearCategoriaBtn: 'Erstellen',
    verCategoriaBtn: 'Anzeigen →',
    productosActivos: 'aktive Produkte',
    productoActivo: 'aktives Produkt',
    errorNombreCategoriaVacio: 'Bitte gib den Namen der Kategorie ein.',
    errorCategoriaExiste: 'Die Kategorie existiert bereits.',
    categoriaCreadaExito: 'Kategorie erfolgreich erstellt.',

    ajustesTitulo: 'Einstellungen und Sicherheit',
    ajustesSubtitulo: 'Persönliche Konfiguration von Mein Gefrierschrank',
    idiomaSeccionTitulo: 'Sprache / Idioma',
    idiomaSeccionDesc: 'Wähle die Anzeigesprache der App',
    pinSeccionTitulo: 'Sicherheits-PIN',
    pinSeccionDesc: 'Schütze deinen Bestand vor unbefugtem Zugriff',
    bloquearBtn: 'Sperren',
    cambiarPinLabel: 'PIN auf diesem Gerät ändern',
    nuevoPinPlaceholder: 'Neuer PIN',
    guardarPinBtn: 'Speichern',
    pinActualLabel: 'Aktueller PIN auf diesem Gerät:',
    pinActualizadoExito: 'PIN auf diesem Gerät erfolgreich aktualisiert.',
    pwaSeccionTitulo: 'PWA-Anwendung',
    pwaSeccionDesc: 'App auf deinem Startbildschirm für Sofortzugriff installieren',
    pwaDisponibilidadLabel: 'Verfügbarkeit auf mobilen Geräten',
    sincronizacionSeccionTitulo: 'Synchronisierung',
    sincronizacionSeccionDesc: 'Daten mit deiner Google Sheets-Tabelle abgleichen',
    sincronizarBtn: 'Synchronisieren',
    sincronizadoExito: 'Bestand erfolgreich synchronisiert.',

    pinModalTitulo: 'Sicherheit',
    pinModalDesc: 'Gib deinen Zugangs-PIN ein, um den Bestand zu synchronisieren und zu bearbeiten.',
    pinInputLabel: 'Zugangs-PIN',
    pinInputPlaceholder: '••••',
    desbloquearBtn: 'Entsperren und verbinden',
    recordarDispositivo: 'Auf diesem Smartphone / Gerät merken',
    errorPinVacio: 'Bitte gib deinen PIN-Code ein.',

    offlineAviso: 'Keine Internetverbindung — Änderungen können erst nach erneuter Verbindung gespeichert werden.',
    errorConexionTitulo: 'Verbindung zum Server fehlgeschlagen',
    reintentarConexion: 'Verbindung erneut versuchen',
    cargandoTitulo: 'Gefrierschrank wird geladen...',
    cargandoSubtitulo: 'Synchronisiere Produkte und Buchungen mit Google Sheets',

    instalarApp: 'App installieren',
    instalarPWA: 'PWA installieren',
    instalarIosTitulo: 'Auf deinem iPhone / iPad installieren',
    paso1IosTitulo: '1. Tippe auf das Teilen-Symbol',
    paso1IosDesc: 'In der Safari-Symbolleiste unten.',
    paso2IosTitulo: '2. Wähle "Zum Home-Bildschirm"',
    paso2IosDesc: 'Scrolle in den Optionen nach unten.',
    iosListoDesc: 'Fertig! Du kannst Mein Gefrierschrank wie eine native App im Vollbildmodus nutzen.',
    entendidoBtn: 'Verstanden',

    toastRetiradoExito: '{cantidad} {unidad} von {producto} erfolgreich entnommen.',
    toastAgregadoExito: '{cantidad} {unidad} zu {producto} erfolgreich hinzugefügt.',
    toastAjusteExito: 'Bestand von {producto} auf {cantidad} {unidad} korrigiert.',
    toastProductoCreadoExito: '"{producto}" in Google Sheets gespeichert.',
    toastProductoEditadoExito: 'Änderungen an "{producto}" gespeichert.',
    toastProductoArchivadoExito: 'Produkt erfolgreich archiviert.',
    toastCategoriaCreadaExito: 'Kategorie "{categoria}" erfolgreich hinzugefügt.',
  },

  es: {
    appName: 'Mi Freezer',
    appSubtitle: 'Control de Inventario',

    navInventario: 'Inventario',
    navMovimientos: 'Movimientos',
    navCategorias: 'Categorías',
    navAjustes: 'Ajustes',

    totalAlimentos: 'Total Alimentos',
    stockBajo: 'Stock Bajo',
    agotado: 'Agotado',
    bajoStockBadge: 'Bajo stock',
    buscarPlaceholder: 'Buscar pechuga, pan, carne...',
    sincronizar: 'Sincronizar con Google Sheets',
    nuevoProducto: 'Nuevo producto',
    nuevoProductoShort: 'Nuevo',
    todos: 'Todos',
    limpiarFiltros: 'Limpiar filtros',

    emptyFreezerTitle: 'Tu freezer está vacío. Agrega tu primer producto.',
    emptyFreezerDesc: 'Lleva el control exacto de tus alimentos congelados, carnes, panes y porciones.',
    emptySearchTitle: 'No se encontraron alimentos',
    emptySearchDesc: 'Ningún alimento coincide con los filtros aplicados.',

    retirarTitulo: 'Retirar',
    agregarTitulo: 'Agregar',
    retirarProducto: 'Retirar',
    agregarProducto: 'Agregar',
    disponibleActual: 'Disponible actual:',
    cantidadRetirar: 'Cantidad a retirar',
    cantidadAgregar: 'Cantidad a agregar',
    todo: 'Todo',
    observacionLabel: 'Observación',
    opcional: 'opcional',
    obsPlaceholderRetirar: 'Ej. Almuerzo del domingo',
    obsPlaceholderAgregar: 'Ej. Compra en carnicería',
    cancelar: 'Cancelar',
    guardar: 'Guardar',
    guardando: 'Guardando...',
    errorCantidadInvalida: 'Ingresa una cantidad válida mayor a 0.',
    errorRetirarMasDeDisponible: 'No puedes retirar más de lo disponible',

    nuevoProductoTitulo: 'Nuevo Producto',
    nuevoProductoSubtitulo: 'Agregar alimento al freezer',
    nombreProductoLabel: 'Nombre del producto *',
    nombreProductoPlaceholder: 'Ej. Pechuga de pollo, Pan francés, Espinaca',
    categoriaLabel: 'Categoría *',
    elegirExistente: 'Elegir existente',
    crearNueva: '+ Crear nueva',
    nuevaCatPlaceholder: 'Nombre de la nueva categoría',
    unidadMedidaLabel: 'Unidad de medida',
    cantidadInicialLabel: 'Cantidad inicial',
    alertaMinimoLabel: 'Alerta de stock bajo',
    guardarProductoBtn: 'Guardar producto',
    errorNombreVacio: 'Por favor indica el nombre del producto.',
    errorNombreDuplicado: 'Ya existe un producto activo con el nombre',
    errorSaldoInvalido: 'La cantidad inicial no puede ser negativa ni inválida.',
    errorMinimoInvalido: 'La cantidad mínima de alerta no puede ser negativa.',

    saldoActualLabel: 'Saldo actual:',
    tabDatos: 'Datos',
    tabAjuste: 'Ajustar Saldo',
    tabArchivar: 'Archivar',
    guardarCambios: 'Guardar cambios',
    infoAjusteTitulo: 'Ajuste de inventario real',
    infoAjusteDesc: 'Esta acción registrará un movimiento de tipo AJUSTE en Google Sheets con el nuevo saldo total.',
    saldoRegistradoActualmente: 'Saldo registrado actualmente:',
    nuevoSaldoExactoLabel: 'Nuevo saldo exacto *',
    motivoAjusteLabel: 'Motivo del ajuste',
    motivoAjustePlaceholder: 'Ej. Recuento físico del freezer, pesaje con balanza',
    registrarAjusteBtn: 'Registrar Ajuste',
    confirmarArchivarTitulo: '¿Deseas archivar el producto?',
    confirmarArchivarDesc: 'El producto ya no se mostrará en tu lista activa del freezer. No se eliminará físicamente de tu hoja de Google Sheets ni se borrará su historial de movimientos.',
    siArchivarBtn: 'Sí, Archivar',
    archivando: 'Archivando...',
    notaModificarSaldo: '* Para modificar la cantidad en stock, utiliza la pestaña "Ajustar Saldo" o los botones [+] y [-] del inventario.',

    movimientosTitulo: 'Historial de Movimientos',
    registrosEncontrados: 'registros encontrados',
    registroEncontrado: 'registro encontrado',
    filtrarAlimentoPlaceholder: 'Filtrar por nombre de alimento...',
    filtroTodos: 'Todos',
    filtroEntradas: '⬇️ Entradas',
    filtroSalidas: '⬆️ Salidas',
    filtroAjustes: '⚖️ Ajustes',
    sinMovimientosTitulo: 'No hay movimientos registrados',
    sinMovimientosDesc: 'Los registros de entradas, salidas y ajustes aparecerán aquí.',
    sinMovimientosFiltroDesc: 'Prueba a cambiar o limpiar los filtros de búsqueda.',
    saldoMovimientoPrefix: 'Saldo:',

    categoriasTitulo: 'Categorías de Alimentos',
    categoriasSubtitulo: 'Organiza tus alimentos congelados por sectores',
    nuevaCategoriaTitulo: 'Nueva Categoría',
    nuevaCategoriaPlaceholder: 'Ej. Mariscos, Lácteos, Helados...',
    crearCategoriaBtn: 'Crear',
    verCategoriaBtn: 'Ver →',
    productosActivos: 'productos activos',
    productoActivo: 'producto activo',
    errorNombreCategoriaVacio: 'Escribe el nombre de la categoría.',
    errorCategoriaExiste: 'La categoría ya existe.',
    categoriaCreadaExito: 'Categoría creada correctamente.',

    ajustesTitulo: 'Ajustes y Seguridad',
    ajustesSubtitulo: 'Configuración personal de Mi Freezer',
    idiomaSeccionTitulo: 'Idioma / Sprache',
    idiomaSeccionDesc: 'Selecciona el idioma de la aplicación',
    pinSeccionTitulo: 'PIN de Seguridad',
    pinSeccionDesc: 'Protege tu inventario contra accesos no deseados',
    bloquearBtn: 'Bloquear',
    cambiarPinLabel: 'Cambiar PIN en este celular',
    nuevoPinPlaceholder: 'Nuevo PIN',
    guardarPinBtn: 'Guardar',
    pinActualLabel: 'PIN configurado actual:',
    pinActualizadoExito: 'PIN actualizado correctamente en este dispositivo.',
    pwaSeccionTitulo: 'Aplicación PWA',
    pwaSeccionDesc: 'Instala la app en tu pantalla de inicio para acceso directo',
    pwaDisponibilidadLabel: 'Disponibilidad en celular',
    sincronizacionSeccionTitulo: 'Sincronización',
    sincronizacionSeccionDesc: 'Mantener datos actualizados con tu planilla',
    sincronizarBtn: 'Sincronizar',
    sincronizadoExito: 'Inventario sincronizado con éxito.',

    pinModalTitulo: 'Seguridad de Mi Freezer',
    pinModalDesc: 'Ingresa tu PIN de acceso para sincronizar y modificar el inventario.',
    pinInputLabel: 'PIN de Acceso',
    pinInputPlaceholder: '••••',
    desbloquearBtn: 'Desbloquear y Conectar',
    recordarDispositivo: 'Recordar en este celular / dispositivo',
    errorPinVacio: 'Por favor ingresa tu código PIN.',

    offlineAviso: 'Sin conexión a internet — No se pueden guardar cambios hasta reconectar.',
    errorConexionTitulo: 'No pudimos conectar con el servidor',
    reintentarConexion: 'Reintentar conexión',
    cargandoTitulo: 'Cargando Mi Freezer...',
    cargandoSubtitulo: 'Sincronizando productos y movimientos con Google Sheets',

    instalarApp: 'Instalar App',
    instalarPWA: 'Instalar PWA',
    instalarIosTitulo: 'Instalar en tu iPhone / iPad',
    paso1IosTitulo: '1. Toca el botón Compartir',
    paso1IosDesc: 'En la barra inferior de Safari.',
    paso2IosTitulo: '2. Elige "Agregar a Inicio"',
    paso2IosDesc: 'Desplaza hacia abajo en las opciones.',
    iosListoDesc: '¡Listo! Podrás abrir Mi Freezer a pantalla completa como una app nativa.',
    entendidoBtn: 'Entendido',

    toastRetiradoExito: '{cantidad} {unidad} retirados con éxito de {producto}.',
    toastAgregadoExito: '{cantidad} {unidad} agregados con éxito a {producto}.',
    toastAjusteExito: 'Saldo de {producto} ajustado a {cantidad} {unidad}.',
    toastProductoCreadoExito: '"{producto}" guardado en Google Sheets.',
    toastProductoEditadoExito: 'Cambios de "{producto}" guardados.',
    toastProductoArchivadoExito: 'Producto archivado correctamente.',
    toastCategoriaCreadaExito: 'Categoría "{categoria}" agregada.',
  },
};

// Default category visual translations
const DEFAULT_CATEGORIES: Record<string, { de: string; es: string }> = {
  carnes: { de: 'Fleisch', es: 'Carnes' },
  fleisch: { de: 'Fleisch', es: 'Carnes' },
  panificados: { de: 'Backwaren', es: 'Panificados' },
  backwaren: { de: 'Backwaren', es: 'Panificados' },
  verduras: { de: 'Gemüse', es: 'Verduras' },
  gemüse: { de: 'Gemüse', es: 'Verduras' },
  gemuse: { de: 'Gemüse', es: 'Verduras' },
  frutas: { de: 'Obst', es: 'Frutas' },
  obst: { de: 'Obst', es: 'Frutas' },
  'comidas preparadas': { de: 'Fertiggerichte', es: 'Comidas preparadas' },
  fertiggerichte: { de: 'Fertiggerichte', es: 'Comidas preparadas' },
  otros: { de: 'Sonstiges', es: 'Otros' },
  sonstiges: { de: 'Sonstiges', es: 'Otros' },
};

/**
 * Translates default categories visually, preserving custom category names
 */
export function translateCategoryName(catName: string | any, lang: LanguageCode): string {
  if (!catName) return '';
  const str = typeof catName === 'string' ? catName : (catName?.nombre || catName?.Categoria || '');
  if (!str) return '';
  const key = str.trim().toLowerCase();
  if (DEFAULT_CATEGORIES[key]) {
    return DEFAULT_CATEGORIES[key][lang];
  }
  return str;
}

/**
 * Translates technical movement types (ENTRADA, SALIDA, AJUSTE) for display
 */
export function translateMovementType(tipo: TipoMovimiento | string, lang: LanguageCode): string {
  const t = (tipo || '').toUpperCase().trim();
  if (lang === 'de') {
    if (t === 'ENTRADA') return 'Zugang';
    if (t === 'SALIDA') return 'Entnahme';
    if (t === 'AJUSTE') return 'Bestandskorrektur';
  } else {
    if (t === 'ENTRADA') return 'Entrada';
    if (t === 'SALIDA') return 'Salida';
    if (t === 'AJUSTE') return 'Ajuste';
  }
  return tipo;
}

/**
 * Translates units for display
 */
export function translateUnitName(unidad: string, cantidad: number, lang: LanguageCode): string {
  const u = (unidad || '').toLowerCase().trim();
  if (lang === 'de') {
    if (u === 'unidad' || u === 'unidades' || u === 'u' || u === 'stk' || u === 'stück') {
      return 'Stück';
    }
    if (u === 'litro' || u === 'litros' || u === 'l' || u === 'liter') {
      return 'Liter';
    }
    if (u === 'kg' || u === 'kilo' || u === 'kilos') {
      return 'kg';
    }
    if (u === 'g' || u === 'gramo' || u === 'gramos') {
      return 'g';
    }
    return unidad;
  } else {
    if (u === 'unidad' || u === 'unidades' || u === 'u' || u === 'stk' || u === 'stück') {
      return cantidad === 1 ? 'unidad' : 'unidades';
    }
    if (u === 'litro' || u === 'litros' || u === 'l' || u === 'liter') {
      return cantidad === 1 ? 'litro' : 'litros';
    }
    if (u === 'kg' || u === 'kilo' || u === 'kilos') {
      return 'kg';
    }
    if (u === 'g' || u === 'gramo' || u === 'gramos') {
      return 'g';
    }
    return unidad;
  }
}
