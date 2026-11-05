import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "../card/card";

import style from "./Cards.module.css";

const Cards = ({ allPosts = [] }) => {
  const premiumPosts = useMemo(() => {
    return [...allPosts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
      .filter((post) => post.User?.plan === "premium");
  }, [allPosts]);

  const postCount = premiumPosts.length;

  if (postCount === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className={style.cards}
    >
      <div className={style.masRec}>
        <h3>Publicaciones destacadas</h3>
      </div>

      <ul className={style.featured}>
        {premiumPosts.map((post) => (
          <li key={post.id}>
            <Card post={post} />
          </li>
        ))}
      </ul>
    </motion.section>
  );
};

export default Cards;
