import { Component, Event, EventEmitter, Prop, Watch, h } from "@stencil/core";
import { Component as ChComponent } from "../../../common/interfaces";
import {
  DataModelItemLabels,
  EntityInfo,
  ErrorText,
  ItemInfo
} from "../data-modeling-item/next-data-modeling-item";
import {
  DataModel,
  Entity,
  EntityItem,
  EntityNameToATTs
} from "../data-modeling/data-model";
import { ChNextDataModelingItemCustomEvent } from "../../../components";

const getSubLevelEntitiesATTs = (
  result: EntityNameToATTs,
  level: EntityItem[]
) => {
  level.forEach(entityItem => {
    const entityItemLevel = entityItem.Level;

    if (entityItem.Type === "LEVEL") {
      /* Following level entities with DataType */
      result[entityItem.DataType] = entityItemLevel.map(
        subEntityItem => subEntityItem.Name
      );

      getSubLevelEntitiesATTs(result, entityItemLevel);
    }
  });
};

const updateToEntityATTs = (dm: DataModel): EntityNameToATTs => {
  if (!dm) {
    return {};
  }
  const result: EntityNameToATTs = {};

  dm.Entities.forEach((entity: Entity) => {
    const entityLevel = entity.Level;
    /* First level entities with name */
    result[entity.Name] = entityLevel.map(entityItem => entityItem.Name);

    if (entityLevel) {
      getSubLevelEntitiesATTs(result, entityLevel);
    }
  });

  return result;
};

@Component({
  shadow: false,
  styleUrl: "next-data-modeling-render.scss",
  tag: "ch-next-data-modeling-render"
})
export class NextDataModeling implements ChComponent {
  private entityNameToATTs: EntityNameToATTs;
  private entities: string[] = [];

  private editedControl: HTMLChNextDataModelingItemElement = null;
  private entityWasAdded: "adding" | "finished" | "none" = "none";

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class when
   * adding mode is enabled.
   */
  @Prop() readonly addingModeCommonClass: string;

  /**
   * The labels used in the buttons of the items. Important for accessibility.
   */
  @Prop() readonly captions: DataModelItemLabels = {
    ATT: "Attribute",
    ENTITY: "Entity",
    LEVEL: "Collection",
    adding: "Adding...",
    addNewEntity: "Add new entity",
    addNewField: "Add new field",
    cancel: "Cancel",
    collection: "Collection",
    confirm: "Confirm",
    delete: "Delete",
    deleteMode: "Confirm delete?",
    deleting: "Deleting...",
    edit: "Edit",
    editing: "Saving...",
    newEntity: "New Entity",
    newField: "New Field"
  };

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class.
   */
  @Prop() readonly commonClass: string;

  /**
   * This callback is used to created a new SDT GxCollectionField based on the
   * EntityItem type.
   */
  @Prop() readonly createGxCollectionCallback: () => EntityItem[];

  /**
   * A CSS class to set as the `ch-next-data-modeling` element class.
   */
  @Prop() readonly cssClass: string;

  /**
   * This property represents the UI model that is currently rendered.
   */
  @Prop() readonly dataModel: DataModel;
  @Watch("dataModel")
  handleDataModelChange(newDataModel: DataModel) {
    this.entityNameToATTs = updateToEntityATTs(newDataModel);
    this.entities = Object.keys(this.entityNameToATTs);
  }

  /**
   * This property represents a copy of the UI model that is currently rendered.
   * Useful for making changes that may or may not be accepted by the server.
   */
  @Prop() readonly dataModelToEdit: DataModel;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event.
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class with
   * `level === "0"` and `mode === "add"`.
   */
  @Prop() readonly entityAddingModeClass: string;

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class with
   * `level === "0"` and `mode !== "add"`.
   */
  @Prop() readonly entityClass: string;

  /**
   * The error texts used for the new field input.
   */
  @Prop() readonly errorTexts: { [key in ErrorText]: string } = {
    Empty: "Field is empty.",
    AlreadyDefined1: "Field ",
    AlreadyDefinedEntity1: "Entity ",
    AlreadyDefined2: " already exists."
  };

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class with
   * `level === "0" | "1"` and `mode === "add"`.
   */
  @Prop() readonly fieldAddingModeClass: string;

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class with
   * `level === "1"` and `mode !== "add"`.
   */
  @Prop() readonly fieldClass: string;

  /**
   * A CSS class to set as the `ch-next-data-modeling` element class with
   * `level === "1"`.
   */
  @Prop() readonly fieldContainerClass: string;

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class with
   * (`level === "0"` and `mode !== "add"`) or `level === "1" | "2"`.
   */
  @Prop() readonly fieldCommonClass: string;

  /**
   * This property is a WA due to Angular's bug not letting execute UC 2.0
   * methods on different layouts.
   */
  @Prop() readonly hideLoading: any = null;
  @Watch("hideLoading")
  handleHideLoadingChange() {
    this.editedControl.hideWaitingMode();

    if (this.entityWasAdded === "adding") {
      this.entityWasAdded = "finished";
    }
  }

  /**
   * Determine the maximum amount of ATTs displayed per entity.
   */
  @Prop() readonly maxAtts: number = 3;

  /**
   * This attribute indicates that the user cannot modify the value of the control.
   * Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
   * attribute for `input` elements.
   */
  @Prop() readonly readonly: boolean = false;

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class with
   * `level = "2"` and `mode !== "add"`.
   */
  @Prop() readonly subFieldClass: string;

  /**
   * A CSS class to set as the `ch-next-data-modeling-item` element class with
   * `level = "2"` and `mode === "add"`.
   */
  @Prop() readonly subFieldAddingModeClass: string;

  /**
   * A CSS class to set as the `ch-next-data-modeling` element class with
   * `level === "2"`.
   */
  @Prop() readonly subFieldContainerClass: string;

  /**
   * Emitted when a new field is added or edited.
   */
  @Event() fieldAdded: EventEmitter;

  /**
   * Emitted when a new field is removed.
   */
  @Event() fieldRemoved: EventEmitter;

  private addField =
    (collection: any) =>
    (event: ChNextDataModelingItemCustomEvent<ItemInfo>) => {
      this.addEntityItem(collection, event.detail);
      this.updateReferences(event, true);
    };

  private addEntityItem(collection: any, item: ItemInfo) {
    const newItem: EntityItem = {
      Name: item.name,
      Type: item.type,
      DataType: ""
    };
    collection.push(newItem);
  }

  private deleteField =
    (collection: any, index: number) =>
    (event: ChNextDataModelingItemCustomEvent<any>) => {
      collection.remove(index + 1);

      this.updateReferences(event);
    };

  private editField =
    (entityItem: EntityItem) =>
    (event: ChNextDataModelingItemCustomEvent<ItemInfo>) => {
      entityItem.Name = event.detail.name;
      entityItem.Type = event.detail.type;
      entityItem.DataType = ""; // Remove DataType

      this.updateReferences(event, true);
    };

  private addEntity =
    (collection: any) =>
    (event: ChNextDataModelingItemCustomEvent<EntityInfo>) => {
      const newItem: Entity = {
        Name: event.detail.name,
        Level: this.createGxCollectionCallback()
      };
      collection.push(newItem);
      this.addEntityItem(newItem.Level, event.detail.level[0]);
      this.updateReferences(event, true);

      this.entityWasAdded = "adding";
    };

  private editEntity =
    (entityItem: Entity) =>
    (event: ChNextDataModelingItemCustomEvent<ItemInfo>) => {
      entityItem.Name = event.detail.name;

      this.updateReferences(event, true);
    };

  private updateReferences(
    event: ChNextDataModelingItemCustomEvent<any>,
    fieldAdded = false
  ) {
    event.stopPropagation();
    this.editedControl = event.target;

    if (fieldAdded) {
      this.fieldAdded.emit();
    } else {
      this.fieldRemoved.emit();
    }

    this.processEntityAdding();
  }

  private processEntityAdding() {
    if (!this.editedControl || this.entityWasAdded === "none") {
      return;
    }

    const entityClassList = this.editedControl.classList;
    const firstItemContainerClassList =
      this.editedControl.firstElementChild.classList;
    const firstItemClassList =
      this.editedControl.firstElementChild.firstElementChild.classList;

    if (this.entityWasAdded === "adding") {
      entityClassList.remove(
        this.addingModeCommonClass,
        this.entityAddingModeClass
      );
      entityClassList.add(this.entityClass, this.commonClass);

      firstItemContainerClassList.add(this.fieldContainerClass);

      firstItemClassList.remove(
        this.addingModeCommonClass,
        ...this.fieldAddingModeClass.split(" ")
      );
      firstItemClassList.add(
        this.fieldClass,
        this.fieldCommonClass,
        this.commonClass
      );

      return;
    }

    if (this.entityWasAdded === "finished") {
      entityClassList.remove(this.entityClass);
      entityClassList.add(
        this.addingModeCommonClass,
        this.entityAddingModeClass
      );

      firstItemContainerClassList.remove(this.fieldContainerClass);

      firstItemClassList.remove(this.fieldClass);
      firstItemClassList.add(
        this.addingModeCommonClass,
        ...this.fieldAddingModeClass.split(" ")
      );

      this.entityWasAdded = "none";

      return;
    }
  }

  componentWillLoad() {
    this.handleDataModelChange(this.dataModel);
  }

  render() {
    return (
      <ch-next-data-modeling class={this.cssClass}>
        {this.dataModel != null &&
          this.dataModel.Entities != null &&
          this.dataModel.Entities.map((entity, i) => (
            <ch-next-data-modeling-item
              key={entity.Name}
              captions={this.captions}
              class={this.entityClass + " " + this.commonClass}
              disabled={this.disabled}
              errorTexts={this.errorTexts}
              fieldNames={this.entities}
              name={entity.Name}
              level={0}
              readonly={this.readonly}
              onDeleteField={
                !this.readonly
                  ? this.deleteField(this.dataModelToEdit?.Entities, i)
                  : null
              }
              onEditField={
                !this.readonly
                  ? this.editEntity(this.dataModelToEdit?.Entities[i])
                  : null
              }
            >
              <ch-next-data-modeling class={this.fieldContainerClass}>
                {entity.Level.map((field, j) => (
                  <ch-next-data-modeling-item
                    key={field.Name}
                    captions={this.captions}
                    class={
                      this.fieldClass +
                      " " +
                      this.fieldCommonClass +
                      " " +
                      this.commonClass
                    }
                    dataType={field.DataType}
                    disabled={this.disabled}
                    entityNameToATTs={this.entityNameToATTs}
                    errorTexts={this.errorTexts}
                    fieldNames={this.entityNameToATTs[entity.Name]}
                    maxAtts={this.maxAtts}
                    name={field.Name}
                    readonly={this.readonly}
                    type={field.Type}
                    onDeleteField={
                      !this.readonly
                        ? this.deleteField(
                            this.dataModelToEdit?.Entities[i].Level,
                            j
                          )
                        : null
                    }
                    onEditField={
                      !this.readonly
                        ? this.editField(
                            this.dataModelToEdit?.Entities[i].Level[j]
                          )
                        : null
                    }
                  >
                    {field.Level != null && field.Level.length > 0 && (
                      <ch-next-data-modeling
                        class={this.subFieldContainerClass}
                      >
                        {field.Level.map((subField, k) => (
                          <ch-next-data-modeling-item
                            key={subField.Name}
                            captions={this.captions}
                            class={
                              this.subFieldClass +
                              " " +
                              this.fieldCommonClass +
                              " " +
                              this.commonClass
                            }
                            dataType={subField.DataType}
                            disabled={this.disabled}
                            entityNameToATTs={this.entityNameToATTs}
                            errorTexts={this.errorTexts}
                            fieldNames={this.entityNameToATTs[field.DataType]}
                            level={2}
                            maxAtts={this.maxAtts}
                            name={subField.Name}
                            readonly={this.readonly}
                            type={subField.Type}
                            onDeleteField={
                              !this.readonly
                                ? this.deleteField(
                                    this.dataModelToEdit?.Entities[i].Level[j]
                                      .Level,
                                    k
                                  )
                                : null
                            }
                            onEditField={
                              !this.readonly
                                ? this.editField(
                                    this.dataModelToEdit?.Entities[i].Level[j]
                                      .Level[k]
                                  )
                                : null
                            }
                          ></ch-next-data-modeling-item>
                        ))}

                        {!this.readonly && (
                          <ch-next-data-modeling-item
                            key="-1"
                            captions={this.captions}
                            class={
                              this.subFieldAddingModeClass +
                              " " +
                              this.fieldCommonClass +
                              " " +
                              this.addingModeCommonClass +
                              " " +
                              this.commonClass
                            }
                            disabled={this.disabled}
                            errorTexts={this.errorTexts}
                            fieldNames={this.entityNameToATTs[field.DataType]}
                            level={2}
                            mode="add"
                            type="ATT"
                            onNewField={this.addField(
                              this.dataModelToEdit?.Entities[i].Level[j].Level
                            )}
                          ></ch-next-data-modeling-item>
                        )}
                      </ch-next-data-modeling>
                    )}
                  </ch-next-data-modeling-item>
                ))}

                {!this.readonly && (
                  <ch-next-data-modeling-item
                    key="-1"
                    captions={this.captions}
                    class={
                      this.fieldAddingModeClass +
                      " " +
                      this.fieldCommonClass +
                      " " +
                      this.addingModeCommonClass +
                      " " +
                      this.commonClass
                    }
                    disabled={this.disabled}
                    errorTexts={this.errorTexts}
                    fieldNames={this.entityNameToATTs[entity.Name]}
                    mode="add"
                    type="ATT"
                    onNewField={this.addField(
                      this.dataModelToEdit?.Entities[i].Level
                    )}
                  ></ch-next-data-modeling-item>
                )}
              </ch-next-data-modeling>
            </ch-next-data-modeling-item>
          ))}

        {this.dataModel?.Entities && !this.readonly && (
          <ch-next-data-modeling-item
            key="-1"
            captions={this.captions}
            class={
              this.entityAddingModeClass +
              " " +
              this.addingModeCommonClass +
              " " +
              this.commonClass
            }
            disabled={this.disabled}
            errorTexts={this.errorTexts}
            fieldNames={this.entities}
            level={0}
            mode="add"
            onNewEntity={this.addEntity(this.dataModelToEdit?.Entities)}
          >
            <ch-next-data-modeling>
              <ch-next-data-modeling-item
                actionsVisible={false}
                captions={this.captions}
                class={
                  this.fieldAddingModeClass +
                  " " +
                  this.fieldCommonClass +
                  " " +
                  this.addingModeCommonClass +
                  " " +
                  this.commonClass
                }
                disabled={this.disabled}
                errorTexts={this.errorTexts}
                mode="add"
                showNewFieldBtn={false}
                type="ATT"
              ></ch-next-data-modeling-item>
            </ch-next-data-modeling>
          </ch-next-data-modeling-item>
        )}
      </ch-next-data-modeling>
    );
  }
}
