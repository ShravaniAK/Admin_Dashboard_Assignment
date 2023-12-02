import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IconContext } from "react-icons";

const API_ENDPOINT =
  "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";

const App = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editMode, setEditMode] = useState({});
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_ENDPOINT);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); 
  }, [searchTerm, users]);

  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  
  const toggleRowSelection = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = [...selectedRows, id];
    } else {
      newSelectedRows = selectedRows.filter((rowId) => rowId !== id);
    }

    setSelectedRows(newSelectedRows);
  };

  
  const toggleAllRowsSelection = () => {
    const allRowIds = currentItems.map((item) => item.id);
    const newSelectedRows =
      selectedRows.length === allRowIds.length ? [] : allRowIds;
    setSelectedRows(newSelectedRows);
  };
  const toggleEditMode = (id) => {
    setEditMode((prevMode) => ({
      ...prevMode,
      [id]: !prevMode[id],
    }));
  };

 
  const handleEdit = (id, updatedName, updatedEmail) => {
    const updatedUserList = users.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          name: updatedName,
          email: updatedEmail,
        };
      }
      return user;
    });

    setUsers(updatedUserList);
    setFilteredUsers(updatedUserList);
    toggleEditMode(id); 
  };
  // //edit
  // const handleEdit = (id, updatedName, updatedEmail) => {
  //   const updatedUserList = users.map((user) => {
  //     if (user.id === id) {
  //       return {
  //         ...user,
  //         name: updatedName,
  //         email: updatedEmail,
  //       };
  //     }
  //     return user;
  //   });

  //   setUsers(updatedUserList);
  //   setFilteredUsers(updatedUserList);
  // };

  
  const handleDelete = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter((user) => user.id !== id));
    setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
  };

  
  const bulkDelete = () => {
    const updatedUsers = users.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setUsers(updatedUsers);
    setFilteredUsers(
      updatedUsers.filter((user) => !selectedRows.includes(user.id))
    );
    setSelectedRows([]);
  };

  return (
    <div className="container mx-auto p-4">
    <div className="bg-white shadow-md rounded my-6">
      <header className="bg-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          {/* <h1 className="text-2xl font-bold mb-4 sm:mb-0">Admin Dashboard</h1> */}
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="flex w-full sm:w-auto border border-blue-200 rounded">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                value={searchTerm}
                style={{ minWidth: '70vw' }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="px-4 text-white bg-blue-600 border-l rounded"
                onClick={() => alert("Search functionality triggered")}
              >
                Search
              </button>
            </div>
          </div>
          <div className="flex justify-end sm:ml-4">
            <button
              className={`text-white px-4 py-2 rounded ${
                selectedRows.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={bulkDelete}
              disabled={selectedRows.length === 0}
            >
              <IconContext.Provider
                value={{ color: "red", size: "35px" }}
              >
                <div>
                  <MdDeleteOutline />
                </div>
              </IconContext.Provider>
            </button>
          </div>
        </div>
      </header>
        <main className="p-4">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="bg-gray-200 p-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === currentItems.length &&
                      currentItems.length !== 0
                    }
                    onChange={toggleAllRowsSelection}
                  />
                </th>
                <th className="bg-gray-200 p-2">Name</th>
                <th className="bg-gray-200 p-2">Email</th>
                <th className="bg-gray-200 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user) => (
                <tr
                  key={user.id}
                  className={
                    selectedRows.includes(user.id) ? "bg-gray-100" : "bg-white"
                  }
                >
                  <td className="border px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(user.id)}
                      onChange={() => toggleRowSelection(user.id)}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    {editMode[user.id] ? (
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) =>
                          handleEdit(user.id, e.target.value, user.email)
                        }
                        className="border border-gray-300 px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editMode[user.id] ? (
                      <input
                        type="text"
                        value={user.email}
                        onChange={(e) =>
                          handleEdit(user.id, user.name, e.target.value)
                        }
                        className="border border-gray-300 px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      className="text-white px-2 py-1 rounded mr-2"
                      onClick={() => toggleEditMode(user.id)}
                    >
                      <IconContext.Provider
                        value={{ color: "blue", size: "35px" }}
                      >
                        <div>
                          <FaRegEdit />
                        </div>
                      </IconContext.Provider>
                    </button>
                    <button
                      className="text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(user.id)}
                    >
                      <IconContext.Provider
                        value={{ color: "red", size: "35px" }}
                      >
                        <div>
                          <MdDeleteOutline />
                        </div>
                      </IconContext.Provider>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center items-center mt-4">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
              onClick={() =>
                handlePageChange(currentPage > 1 ? currentPage - 1 : 1)
              }
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
              onClick={() =>
                handlePageChange(
                  currentPage < totalPages ? currentPage + 1 : totalPages
                )
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
  
};

export default App;
