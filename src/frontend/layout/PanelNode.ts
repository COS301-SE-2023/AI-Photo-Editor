// N-way tree of panels
export class PanelNode {}

export class PanelGroup extends PanelNode {
    constructor(
        public name: string
    ) { super(); }

    removePanel(index: number) {
        this.panels.splice(index, 1);
    }
    addPanel(content: string, index: number) {
        this.panels.splice(index, 0, new PanelLeaf(content, this));
    }
    addPanelGroup(panelGroup: PanelGroup, index: number) {
        this.panels.splice(index, 0, panelGroup);
    }
    getPanel(index: number): PanelNode {
        return this.panels[index];
    }
    getPanels(): PanelNode[] {
        return this.panels;
    }
    panels: PanelNode[] = [];
}

export class PanelLeaf extends PanelNode {
    constructor(
        public content: string,
        public parent: PanelGroup
    ) { super(); }
    component: any;
}