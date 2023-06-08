import axios from "axios";

const baseUrl = "/api/users";

const create = async (user) => {
  const response = await axios.post(baseUrl, user);
  return response.data;
};

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

// eslint-disable-next-line import/no-anonymous-default-export
const usersService = {
  getAll,
  create,
};
export default usersService;
