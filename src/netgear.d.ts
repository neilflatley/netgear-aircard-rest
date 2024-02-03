export interface NetgearStatus {
    custom:   Custom;
    webd:     Webd;
    lcd:      LCD;
    sim:      Sim;
    sms:      SMS;
    session:  Session;
    general:  General;
    power:    Power;
    wwan:     WWAN;
    wwanadv:  Wwanadv;
    wifi:     Wifi;
    router:   Router;
    fota:     Fota;
    cradle:   Cradle;
    eventlog: Eventlog;
    ui:       UI;
}

export interface Cradle {
    mode:                boolean;
    smartMode:           boolean;
    url:                 string;
    primarySSID:         string;
    primaryPassphrase:   string;
    secondarySSID:       string;
    secondaryPassphrase: string;
    end:                 string;
}

export interface Custom {
    lastWifiChan: number;
    dsaLocalUrl:  string;
    end:          number;
}

export interface Eventlog {
    level: number;
    end:   number;
}

export interface Fota {
    fwupdater: Fwupdater;
}

export interface Fwupdater {
    available:     boolean;
    chkallow:      boolean;
    chkstatus:     string;
    dloadProg:     number;
    error:         boolean;
    lastChkDate:   number;
    state:         string;
    isPostponable: boolean;
    statusCode:    number;
    chkTimeLeft:   number;
    dloadSize:     number;
    end:           string;
}

export interface General {
    defaultLanguage:     string;
    PRIid:               string;
    SPClockStatus:       string;
    activationDate:      string;
    genericResetStatus:  string;
    reconditionDate:     string;
    manufacturer:        string;
    model:               string;
    HWversion:           string;
    FWversion:           string;
    buildDate:           string;
    BLversion:           string;
    PRIversion:          string;
    truInstallAvailable: boolean;
    truInstallVersion:   string;
    IMEI:                string;
    SVN:                 string;
    MEID:                string;
    ESN:                 string;
    FSN:                 string;
    activated:           boolean;
    webAppVersion:       string;
    HIDenabled:          boolean;
    truInstallEnabled:   boolean;
    truInstallSupported: boolean;
    TCAaccepted:         boolean;
    LEDenabled:          boolean;
    showAdvHelp:         boolean;
    keyLockState:        string;
    devTemperature:      number;
    verMajor:            number;
    verMinor:            number;
    environment:         string;
    currTime:            number;
    timeZoneOffset:      number;
    deviceName:          string;
    useMetricSystem:     boolean;
    factoryResetStatus:  string;
    setupCompleted:      boolean;
    languageSelected:    boolean;
    systemAlertList:     Mep[];
    apiVersion:          string;
    companyName:         string;
    configURL:           string;
    profileURL:          string;
    pinChangeURL:        string;
    portCfgURL:          string;
    portFilterURL:       string;
    wifiACLURL:          string;
    supportedLangList:   SupportedLangList[];
}

export interface SupportedLangList {
    id?:        string;
    isCurrent?: string;
    isDefault?: string;
    label?:     string;
    token1?:    string;
    token2?:    string;
}

export interface Mep {
}

export interface LCD {
    backlightEnabled:   boolean;
    backlightActive:    boolean;
    inactivityTimer:    number;
    inactivityTimerAC:  number;
    inactivityTimerUSB: number;
    brightnessOnBatt:   string;
    brightnessOnUSB:    string;
    brightnessOnAC:     string;
    backlightOverride:  string;
    end:                string;
}

export interface Power {
    PMState:             string;
    SmState:             string;
    battLowThreshold:    number;
    autoOff:             AutoOff;
    standby:             Standby;
    autoOn:              AutoOn;
    batteryTemperature:  number;
    batteryVoltage:      number;
    battChargeLevel:     number;
    battChargeSource:    string;
    batteryState:        string;
    battChargeAlgorithm: string;
    batterySupported:    boolean;
    charging:            boolean;
    buttonHoldTime:      number;
    deviceTempCritical:  boolean;
    resetreason:         number;
    resetRequired:       string;
    lpm:                 boolean;
    end:                 string;
}

export interface AutoOff {
    onUSBdisconnect: OnUSBdisconnect;
    onIdle:          OnIdle;
}

export interface OnIdle {
    timer: Timer;
}

export interface Timer {
    onAC:      number;
    onBattery: number;
    end:       string;
    onUSB?:    number;
}

export interface OnUSBdisconnect {
    enable:         boolean;
    countdownTimer: number;
    end:            string;
}

export interface AutoOn {
    enable: boolean;
    end:    string;
}

export interface Standby {
    onIdle: OnIdle;
}

export interface Router {
    gatewayIP:              string;
    DMZaddress:             string;
    DMZenabled:             boolean;
    forceSetup:             boolean;
    DHCP:                   RouterDHCP;
    usbMode:                string;
    usbNetworkTethering:    boolean;
    portFwdEnabled:         boolean;
    portFwdList:            Mep[];
    portFilteringEnabled:   boolean;
    portFilteringMode:      string;
    portFilterWhiteList:    Mep[];
    portFilterBlackList:    Mep[];
    hostName:               string;
    domainName:             string;
    ipPassThroughEnabled:   boolean;
    ipPassThroughSupported: boolean;
    Ipv6Supported:          boolean;
    clientList:             ClientList[];
    end:                    string;
}

export interface RouterDHCP {
    serverEnabled: boolean;
    DNS1:          string;
    DNS2:          string;
    DNSmode:       string;
    USBpcIP:       string;
    leaseTime:     number;
    range:         Range;
}

export interface Range {
    high: string;
    low:  string;
    end:  string;
}

export interface ClientList {
    IP?:     string;
    MAC?:    string;
    name?:   string;
    onUSB?:  boolean;
    source?: string;
}

export interface Session {
    userRole: string;
    lang:     string;
    secToken: string;
}

export interface Sim {
    pin:         Pin;
    puk:         Puk;
    mep:         Mep;
    phoneNumber: string;
    iccid:       string;
    imsi:        string;
    SPN:         string;
    status:      string;
    end:         string;
}

export interface Pin {
    mode:  string;
    retry: number;
    end:   string;
}

export interface Puk {
    retry: number;
}

export interface SMS {
    ready:         boolean;
    sendEnabled:   boolean;
    sendSupported: boolean;
    unreadMsgs:    number;
    msgCount:      number;
    msgs:          Msg[];
    trans:         Mep[];
    sendMsg:       SendMsg[];
    end:           string;
}

export interface Msg {
    id?:     string;
    rxTime?: string;
    text?:   string;
    sender?: string;
    read?:   boolean;
}

export interface SendMsg {
    clientId?:  string;
    enc?:       string;
    errorCode?: number;
    msgId?:     number;
    receiver?:  string;
    status?:    string;
    text?:      string;
    txTime?:    string;
}

export interface UI {
    serverDaysLeftHide: boolean;
    promptActivation:   boolean;
    end:                number;
}

export interface Webd {
    ownerModeEnabled: boolean;
    end:              string;
}

export interface Wifi {
    enabled:            boolean;
    status:             string;
    mode:               string;
    maxClientSupported: number;
    maxClientLimit:     number;
    maxClientCnt:       number;
    encryption:         string;
    channel:            number;
    "2gBandwidth":      string;
    "5gBandwidth":      string;
    txPower:            string;
    hiddenSSID:         boolean;
    passPhrase:         string;
    passwordReminder:   boolean;
    RTSthreshold:       number;
    fragThreshold:      number;
    accessControl:      string;
    SSID:               string;
    MAC:                string;
    SSIDreminder:       boolean;
    clientCount:        number;
    country:            string;
    wps:                Wps;
    guest:              Guest;
    offload:            Offload;
    accessBlackList:    Mep[];
    accessWhiteList:    Mep[];
    end:                string;
}

export interface Guest {
    maxClientCnt:       number;
    enabled:            boolean;
    encryption:         string;
    SSID:               string;
    passPhrase:         string;
    generatePassphrase: boolean;
    accessProfile:      string;
    hiddenSSID:         boolean;
    chan:               number;
    mode:               string;
    DHCP:               GuestDHCP;
}

export interface GuestDHCP {
    range: Range;
}

export interface Offload {
    activationRequired: boolean;
    bars:               number;
    rx:                 number;
    tx:                 number;
    enabled:            boolean;
    rssi:               number;
    securityStatus:     string;
    status:             string;
    supported:          boolean;
    connectionSsid:     string;
    networkList:        Mep[];
    end:                string;
}

export interface Wps {
    supported: string;
    enabled:   string;
    mode:      string;
    status:    string;
    end:       string;
}

export interface WWAN {
    prlVersion:               number;
    bandDisablementMaskLTE:   string;
    bandDisablementMask:      string;
    netScanStatus:            string;
    LTEeHRPDConfig:           string;
    roamingEnhancedIndicator: number;
    roamingMode:              string;
    roamingGuardDom:          string;
    roamingGuardIntl:         string;
    roamingType:              string;
    inactivityCause:          number;
    currentNWserviceType:     string;
    registerRejectCode:       number;
    netSelEnabled:            string;
    netRegMode:               string;
    IPv6:                     string;
    roaming:                  boolean;
    IP:                       string;
    registerNetworkDisplay:   string;
    RAT:                      string;
    bandRegion:               BandRegion[];
    autoconnect:              string;
    profileList:              ProfileList[];
    profile:                  Profile;
    dataUsage:                DataUsage;
    netManualNoCvg:           boolean;
    connection:               string;
    connectionType:           string;
    currentPSserviceType:     string;
    ca:                       CA;
    connectionText:           string;
    sessDuration:             number;
    sessStartTime:            number;
    dataTransferred:          string;
    dataTransferredRx:        string;
    dataTransferredTx:        string;
    signalStrength:           SignalStrength;
}

export interface BandRegion {
    index?:   number;
    name?:    string;
    current?: boolean;
}

export interface CA {
    end: string;
}

export interface DataUsage {
    total:                     Total;
    server:                    Server;
    serverDataRemaining:       number;
    serverDataTransferred:     number;
    serverDataTransferredIntl: number;
    serverDataValidState:      string;
    serverDaysLeft:            number;
    serverErrorCode:           string;
    serverLowBalance:          boolean;
    serverMsisdn:              string;
    serverRechargeUrl:         string;
    prepaidAccountState:       string;
    accountType:               string;
    share:                     Share;
    generic:                   Generic;
}

export interface Generic {
    dataLimitValid:         boolean;
    usageHighWarning:       number;
    lastSucceeded:          string;
    billingDay:             number;
    nextBillingDate:        string;
    lastSync:               string;
    billingCycleRemainder:  string;
    billingCycleLimit:      number;
    dataTransferred:        number;
    dataTransferredRoaming: number;
    lastReset:              string;
    userDisplayFormat:      string;
    end:                    string;
}

export interface Server {
    accountType:    string;
    subAccountType: string;
    end:            string;
}

export interface Share {
    enabled:               boolean;
    dataTransferredOthers: number;
    lastSync:              string;
    end:                   string;
}

export interface Total {
    lteBillingTx:  number;
    lteBillingRx:  number;
    cdmaBillingTx: number;
    cdmaBillingRx: number;
    gwBillingTx:   number;
    gwBillingRx:   number;
    lteLifeTx:     number;
    lteLifeRx:     number;
    cdmaLifeTx:    number;
    cdmaLifeRx:    number;
    gwLifeTx:      number;
    gwLifeRx:      number;
    end:           string;
}

export interface Profile {
    default:    number;
    defaultLTE: number;
    end:        string;
}

export interface ProfileList {
    index?:          number;
    id?:             string;
    name?:           string;
    apn?:            string;
    username?:       string;
    password?:       string;
    authtype?:       string;
    ipaddr?:         string;
    type?:           string;
    pdproamingtype?: string;
}

export interface SignalStrength {
    rssi: number;
    rscp: number;
    ecio: number;
    rsrp: number;
    rsrq: number;
    bars: number;
    sinr: number;
    end:  string;
}

export interface Wwanadv {
    curBand:           string;
    radioQuality:      number;
    country:           string;
    RAC:               number;
    LAC:               number;
    MCC:               string;
    MNC:               string;
    MNCFmt:            number;
    cellId:            number;
    chanId:            number;
    primScode:         number;
    plmnSrvErrBitMask: number;
    chanIdUl:          number;
    txLevel:           number;
    rxLevel:           number;
    end:               string;
}
