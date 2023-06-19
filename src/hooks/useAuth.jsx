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

  return [addToken, fetchToken];
};

export default useAuth;
