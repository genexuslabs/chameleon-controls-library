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
  DataModel,
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
   * This property represents the current data model of the project.
   */
  @Prop() readonly dataModel: DataModel;
  @Watch("dataModel")
  handleDataModelChange(newValue: DataModel) {
    if (newValue?.Entities) {
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
    this.handleDataModelChange(this.dataModel);
  }

  render() {
    return (
      <Host role="list">
        <slot />
      </Host>
    );
  }
}
