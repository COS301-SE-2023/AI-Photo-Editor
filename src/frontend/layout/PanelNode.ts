// N-way tree of panels
export class PanelNode {}

export class PanelGroup extends PanelNode {
    constructor(
        public name: string
    ) { super(); }

    removePanel(index: number) {
        this.panels.splice(index, 1);
    }
    addPanel(content: string) {
        this.panels.push(new PanelLeaf(content, this));
    }
    addPanelGroup(panelGroup: PanelGroup) {
        this.panels.push(panelGroup);
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