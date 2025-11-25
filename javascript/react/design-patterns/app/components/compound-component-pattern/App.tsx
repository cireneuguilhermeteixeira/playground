import { Tabs } from "./Tabs";

export function App() {
  return (
    <div>
      <Tabs.Root defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">General</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Details</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Settings</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="tab1">
          <h2>General</h2>
          <p>Content of General tab.</p>
        </Tabs.Content>

        <Tabs.Content value="tab2">
          <h2>Details</h2>
          <p>Content of Details tab.</p>
        </Tabs.Content>

        <Tabs.Content value="tab3">
          <h2>Settings</h2>
          <p>Content of Settings tab.</p>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}