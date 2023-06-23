import { useContext } from "react";
import { DbContext, UdemyContext } from "../context/context";

const useAuth = () => {
  const { db } = useContext(DbContext);
  const { setToken } = useContext(UdemyContext);

  const addToken = async (token) => {
    await db.auth.insert({
      id: "1",
      token,
    });
    setToken(token);
  };

  const fetchToken = async () => {
    const response = await db.auth
      .findOne({
        selector: {
          id: {
            $eq: "1",
          },
        },
      })
      .exec();
    const { token } = await response._data;
    setToken(token);

    return true;
  };

  const removeToken = async () => {
    const query = await db.auth.find({
      selector: {
        id: {
          $eq: "1",
        },
      },
    });

    await query.remove();

    return true;
  };

  return { addToken, fetchToken, removeToken };
};

export default useAuth;
