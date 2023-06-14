import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h
} from "@stencil/core";
import { Component as ChComponent } from "../../../common/interfaces";
import {
  Entity,
  EntityNameToATTs,
  mapDataModelToEntityATTs
} from "./data-model";

/**
 * @slot - The first level items (entities) of the data model
 */
@Component({
  shadow: true,
  styleUrl: "next-data-modeling.scss",
  tag: "ch-next-data-modeling"
})
export class NextDataModeling implements ChComponent {
  /**
   * This property represents the current entities of the data model of the
   * project.
   */
  @Prop() readonly entities: Entity[];
  @Watch("entities")
  handleDataModelChange(newValue: Entity[]) {
    if (newValue) {
      console.log("newValue");

      const entityNameToATTs: EntityNameToATTs =
        mapDataModelToEntityATTs(newValue);

      this.dataModelUpdate.emit(entityNameToATTs);
    }
  }

  /**
   * Fired when the dataModel is updated.
   */
  @Event() dataModelUpdate: EventEmitter<EntityNameToATTs>;

  componentWillLoad() {
    this.handleDataModelChange(this.entities);
  }

  render() {
    return (
      <Host role="list">
        <slot />
      </Host>
    );
  }
}
