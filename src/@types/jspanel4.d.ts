// complete typescript definitions for jspanel4, released to public domain (CC0) if you want to copy it
declare module "jspanel4/dist/jspanel" {
    export function addScript(src: string, type: string, callback: () => void): void;
    export function ajax(xhrConfig: ContentAjax): void;
    export function create(options: Options): JsPanel;
    export function emptyNode(node: Node): Node;
    export function extend(object: any): void;
    export function ajax(fetch: ContentFetch): void;
    export function getPanels(condition?: (panel: JsPanel) => boolean): JsPanel[];
    export function position(element: Node, position: Position): Node;
    export function remClass(element: Node, classnames: string): Node;
    export function setClass(element: Node, classnames: string): Node;
    export function toggleClass(element: Node, classnames: string): Node;
    export function setStyles(element: Node, stylesobject: CSSStyleDeclaration): Node;
    export function calcColors(color: string): string[];
    export function color(color: string): Color;
    export function darken(color: string, amount: number): string;
    export function lighten(color: string, amount: number): string;
    export function percievedBrightness(color: string): number;

    export const autopositionSpacing: number;
    export const colorFilled: number;
    export const colorFilledDark: number;
    export const colorFilledLight: number;
    export const colorNames: { [name: string]: string };
    export const defaults: Options;
    export const errorReporting: number;
    export const globalCallbacks: ((panel: JsPanel) => void) | null;
    export const icons: { [name: string]: string };
    export const pointerdown: string[];
    export const pointerup: string[];
    export const pointermove: string[];
    export let ziBase: number;

    export interface JsPanel extends HTMLDivElement {
        addControl(config: CustomHeaderControl): JsPanel;
        addToolbar(location: string,
                   toolbar: Node | string | (Node | string)[] | ((panel: JsPanel) => (Node | String)),
                   callback?: (panel: JsPanel) => void): JsPanel;
        close(callback?: (id: string, panel?: JsPanel) => void): string | boolean;
        closeChildpanels(callback?: (panel: JsPanel) => void): JsPanel;
        contentRemove(callback?: (panel: JsPanel) => void): JsPanel;
        dragit(action: string): JsPanel;
        front(callback?: (panel: JsPanel) => void): JsPanel;
        getChildPanels(callback?: (panel: JsPanel, index: number, list: NodeList) => void): NodeList;
        isChildPanel(callback?: (panel: JsPanel, parentPanel?: JsPanel) => void): JsPanel | boolean;
        maximize(callback?: (panel: JsPanel, status: string) => void): JsPanel;
        minimize(callback?: (panel: JsPanel, status: string) => void): JsPanel;
        normalize(callback?: (panel: JsPanel, status: string) => void): JsPanel;
        overlaps(reference: JsPanel, elmntBox?: string, event?: Event): Overlaps;
        reposition(position: Position, updateCache?: boolean, callback?: (panel: JsPanel) => void): Overlaps;
        resize(size: Size, updateCache?: boolean, callback?: (panel: JsPanel) => void): Overlaps;
        resizeit(action: string): JsPanel;
        setBorder(border: string): JsPanel;
        setBorderRadius(border: string | number): JsPanel;
        setControlStatus(control: string, action: string, callback?: (panel: JsPanel) => void): JsPanel;
        setHeaderLogo(logo: Node | string, callback?: (panel: JsPanel) => void): JsPanel;
        setHeaderTitle(title: Node | string | (() => string), callback?: (panel: JsPanel) => void): JsPanel;
        setTheme(title: Theme | string, callback?: (panel: JsPanel) => void): JsPanel;
        smallify(callback?: (panel: JsPanel, status: string) => void): JsPanel;
        unsmallify(callback?: (panel: JsPanel, status: string) => void): JsPanel;

        dock(config: DockConfig): JsPanel;

        options: Options;

        content: HTMLDivElement;
        controlbar: HTMLDivElement;
        footer: HTMLDivElement;
        header: HTMLDivElement;
        headertitle: HTMLDivElement;
        autocloseProgressbar: HTMLDivElement;
        titlebar: HTMLDivElement;

        snappableTo: string | boolean;
        snapped: string | boolean;
        status: string;
    }

    export interface Options {
        addCloseControl?: number,
        animateIn?: string,
        animateOut?: string,
        autoclose?: AutoCloseSettings | number | boolean,
        border?: string,
        borderRadius?: string | number,
        boxShadow?: number,
        callback?: (panel: JsPanel) => void,
        closeOnEscape?: boolean,
        config?: Options,
        container?: Node | string,
        content?: Node | string | ((panel: JsPanel) => void),
        contentAjax?: ContentAjax | string,
        contentFetch?: ContentFetch | string,
        contentOverflow?: string,
        contentSize?: Size | string,
        data?: any,
        dragit?: DragIt,
        footerToolbar?: Node | Node[] | string | ((panel: JsPanel) => string | Node),
        header?: boolean | string,
        headerControls?: HeaderControls | string,
        headerLogo?: string,
        headerTitle?: Node | string | (() => string),
        headerToolbar?: Node | Node[] | string | ((panel: JsPanel) => string | Node),
        iconfont?: string | string[],
        id?: string | (() => string),
        maximizedMargin?: number[] | number,
        minimizeTo?: string | boolean,
        onbeforeclose?: ((panel: JsPanel, status: string, closedByUser: boolean) => void)
            | ((panel: JsPanel, status: string, closedByUser: boolean) => void)[],
        onbeforemaximize?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onbeforeminimize?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onbeforesmallify?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onbeforeunsmallify?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onclosed?: ((panel: JsPanel, closedByUser: boolean) => void) | ((panel: JsPanel, closedByUser: boolean) => void)[],
        onfronted?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onmaximized?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onminimized?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onnormalized?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onsmallified?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onunsmallified?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onstatuschange?: ((panel: JsPanel, status: string) => void) | ((panel: JsPanel, status: string) => void)[],
        onparentresize?: ((panel: JsPanel, size: Size) => void) | boolean,
        onwindowresize?: ((event: Event, panel: JsPanel) => void) | boolean,
        opacity?: number,
        panelSize?: Size | string,
        paneltype?: string,
        position?: boolean | string | Position,
        resizeit?: ResizeIt | boolean,
        rtl?: RightToLeft,
        setStatus?: string,
        syncMargins?: boolean,
        template?: HTMLElement,
        theme?: Theme | string,
    }

    export interface AutoCloseSettings {
        time: number | string,
        progressbar: boolean,
        background: string,
    }

    export interface ContentAjax {
        url: string,
        method?: string,
        async?: boolean,
        data?: any,
        user?: string,
        pwd?: string,
        timeout?: number,
        withCredentials?: boolean,
        responseType?: string,

        done?: (xhr: XMLHttpRequest, panel: JsPanel) => void,
        fail?: (xhr: XMLHttpRequest, panel: JsPanel) => void,
        always?: (xhr: XMLHttpRequest, panel: JsPanel) => void,
        beforeSend?: (xhr: XMLHttpRequest, panel: JsPanel) => void,
        autoresize?: boolean,
        autoreposition?: boolean,
    }
    export interface ContentFetch {
        resource: string,
        bodyMethod?: string,
        fetchInit?: RequestInfo,
        done?: (response: Response, panel: JsPanel) => void,
        beforeSend?: (fetchConfig: RequestInfo, panel: JsPanel) => void,
        autoresize?: boolean,
        autoreposition?: boolean,
    }

    export interface Size {
        width: string | number | ((panel: JsPanel) => string | number),
        height: string | number | ((panel: JsPanel) => string | number),
    }

    export interface Position {
        my?: string | ((panel: JsPanel) => string),
        at?: string | ((panel: JsPanel) => string),
        of?: string | Node | ((panel: JsPanel) => string | Node),
        autoposition?: string,
        offsetX?: string | number | ((panel: JsPanel) => string | number),
        offsetY?: string | number | ((panel: JsPanel) => string | number),
        minLeft?: string | number | ((panel: JsPanel) => string | number),
        maxLeft?: string | number | ((panel: JsPanel) => string | number),
        maxTop?: string | number | ((panel: JsPanel) => string | number),
        minTop?: string | number | ((panel: JsPanel) => string | number),
        modify?: (pos: PanelPositionData, position: Position) => PanelPositionData,
    }

    export interface DragIt {
        axis?: string,
        containment: number | number[]
        move?: string,
        cursor?: string,
        disable?: boolean,
        disableOnMaximized?: boolean,
        drop?: Drop,
        grid?: number[],
        handles?: string,
        opacity?: number,
        start?: (panel: JsPanel, pos: PanelPositionData, event: Event) => void,
        drag?: (panel: JsPanel, pos: PanelPositionData, event: Event) => void,
        stop?: (panel: JsPanel, pos: PanelPositionData, event: Event) => void,
        snap?: Snap | boolean,
    }

    export interface Drop {
        dropZones: string,
        callback: (panel: JsPanel, target: HTMLElement, source: HTMLElement) => void;
    }

    export interface ResizeIt {
        aspectRatio?: string,
        containment?: number | number[],
        disable?: boolean,
        grid?: number[],
        handles?: string,
        minWidth?: number,
        minHeight?: number,
        maxWidth?: number,
        maxHeight?: number,
        start?: ((panel: JsPanel, panelData: PanelPositionData, event: Event) => void) | ((panel: JsPanel, panelData: PanelPositionData, event: Event) => void)[],
        stop?: ((panel: JsPanel, panelData: PanelPositionData, event: Event) => void) | ((panel: JsPanel, panelData: PanelPositionData, event: Event) => void)[],
    }

    export interface PanelPositionData {
        left: number,
        top: number,
        width?: number,
        height?: number,
    }

    export interface Snap {
        callback?: (panel: JsPanel) => void,
        snapRightTop?: boolean | ((panel: JsPanel) => void),
        snapCenterTop?: boolean | ((panel: JsPanel) => void),
        snapLeftTop?: boolean | ((panel: JsPanel) => void),

        snapRightCenter?: boolean | ((panel: JsPanel) => void),
        snapLeftCenter?: boolean | ((panel: JsPanel) => void),

        snapRightBottom?: boolean | ((panel: JsPanel) => void),
        snapCenterBottom?: boolean | ((panel: JsPanel) => void),
        snapLeftBottom?: boolean | ((panel: JsPanel) => void),

        containment?: boolean,
        repositionOnSnap?: boolean,
        resizeToPreSnap?: boolean,

        sensitivity?: number,
        trigger?: string,
        active?: string,
    }

    export interface HeaderControls {
        close?: string,
        maximize?: string,
        normalize?: string,
        minimize?: string,
        smallify?: string,
        size?: string,
        add?: CustomHeaderControl | CustomHeaderControl[],
    }

    export interface CustomHeaderControl {
        html: string,
        name?: string,
        handler?: (panel: JsPanel, control: HTMLElement) => void,
        position?: number,
        afterInsert?: (control: HTMLElement) => void,
    }

    export interface RightToLeft {
        rtl: boolean,
        lang?: string,
    }

    export interface Theme {
        bgPanel: string,
        bgContent: string,
        colorHeader: string,
        colorContent: string,
        border?: string,
    }

    export interface Overlaps {
        overlaps: boolean,
        top: number,
        right: number,
        bottom: number,
        left: number,
        parentBorderWidth: PanelPositionData,
        referenceRect: DOMRect,
        panelRect: DOMRect,
        pointer?: ReferenceRelativeCoords,
    }

    interface ReferenceRelativeCoords {
        clientX: number,
        clientY: number,
        left: number,
        top: number,
        right: number,
        bottom: number,
    }

    interface Color {
        rgb: {
            css: string,
            r: string,
            g: string,
            b: string,
        },
        hex: string,
        hsl: {
            css: string,
            h: string,
            s: string,
            l: string,
        }
    }

    export interface DockConfig {
        master: Node | string,
        position: Position,
        linkSlaveWidth?: boolean,
        linkSlaveHeight?: boolean,
        callback: (master: Node, slave: Node) => void,
    }


    export namespace contextmenu {
        export const version: string;
        export const date: string;
        export const defaults: ContextMenuOptions;

        export interface ContextMenuOptions extends Options {
            target: Node | string,
        }

        export function create(config: ContextMenuOptions, event?: string): void;
    }

    export namespace datepicker {
        export const version: string;
        export const date: string;
        export const defaults: DatePickerOptions;

        export interface DatePickerOptions extends Options {
            locale?: string,
            startdate?: string,
            months?: number,
            showWeekNumbers?: boolean,
            ondateselect?: (container: Container, date: string, event: Event) => void,
            onrangeselect?: (container: Container, date: string, event: Event) => void,
        }

        export interface Container extends HTMLElement {
            selectedDays: Set<string>,
            selectedRange: Set<string>,
        }

        export function create(container: Node, config: DatePickerOptions): Container;
    }

    export namespace hint {
        export const version: string;
        export const date: string;
        export const defaults: Options;

        export function create(config: Options): void;
    }

    export namespace layout {
        export const version: string;
        export const date: string;
        export const storage: any;

        export interface SaveConfig {
            selector?: string,
            storagename?: string,
        }

        export interface RestoreIdConfig extends RestoreConfig {
            id: string,
        }
        export interface RestoreConfig {
            configs: { [id: string]: Options }
            storagename?: string,
        }

        export function save(config?: SaveConfig): void;
        export function restore(config: RestoreConfig): void;
        export function restoreId(config: RestoreIdConfig): void;
        export function getAll(storagename?: string): any[];
        export function getDataset(value: string, attr?: string, storagename?: string, findall?: boolean): any | any[];
    }

    export namespace tooltip {
        export const version: string;
        export const date: string;
        export const defaults: ToolTipOptions;

        export interface ToolTipOptions extends Options {
            target: Node | string,
            mode?: string,
            delay?: number,
            connector?: boolean | string,
            ttipEvent?: string,
            ttipName?: string,
            autoshow?: boolean
        }

        export function create(config: ToolTipOptions, callback: (panel: JsPanel) => void): void;
        export function reposition(tooltip: JsPanel, position: Position, callback: (panel: JsPanel) => void): void;
        export function remove(target: Node, ttipEvent: string, ttipName: string): void;
    }
}

