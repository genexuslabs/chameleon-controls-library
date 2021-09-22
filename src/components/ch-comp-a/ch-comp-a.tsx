import { Component, Host, h, State } from "@stencil/core";
import { Universe } from "stencil-wormhole";

@Component({
  tag: "ch-comp-a",
  styleUrl: "ch-comp-a.css",
  shadow: true,
})
export class ChCompA {
  // 1. Setup your state.
  @State() state: Record<string, any> = {
    message: "apples",
    data: { content: 1 },
    // ...
  };

  componentWillLoad() {
    // 2. Create the universe (it has to be called in this lifecycle method).
    //Universe.create(this, this.state);
  }

  // 3. Update your state as usual.

  render() {
    return (
      // 4. Create the universe provider.
      <Universe.Provider state={this.state}>
        <my-child />
      </Universe.Provider>
    );
  }
}
