import { useState } from "react";
import { useReducer, useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "./module_bindings";

function MainPage() {
  const [count, setCount] = useState(0);

  const { identity, isActive: connected } = useSpacetimeDB();
  console.log("Identity:", identity);
  console.log("Connected:", connected);

  const sayHello = useReducer(reducers.sayHello);
  const addPerson = useReducer(reducers.add);

  const [name, setName] = useState("");

  // Subcribe to the Person table
  const [persons] = useTable(tables.person);
  console.log("People in DB", persons);

  const handleAdd = () => {
    if (name.trim()) {
      addPerson({ name: name.trim() });
      setName("");
    }
  };

  return (
    <div>
      <section id="center">
        <div className="hero">
          <h1>Persons</h1>
          {persons.length === 0 ? (
            <p>No persons yet</p>
          ) : (
            <ul className="person-list">
              {persons.map((person, idx) => (
                <li key={idx}>
                  <span className="person-name">{person.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            style={{ padding: "5px 10px", marginRight: "8px" }}
          />
          <button className="counter" onClick={handleAdd}>
            Add Person
          </button>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Database</h2>
          <p>Person table</p>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Total Persons</h2>
          <p>{persons.length} in database</p>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  );
}

export default MainPage;
