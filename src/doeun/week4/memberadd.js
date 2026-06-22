export const createNewMember = (event) => {
  const formData = new FormData(event.target);
  
  return {
    name: formData.get("name"),
    part: formData.get("part"),
    tech: formData.get("tech"),
    intro: formData.get("intro"),
    description: formData.get("description"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    comment: formData.get("comment"),
    image: formData.get("image"),
    isMe: false
  };
};

/*
  리스트에서 마지막 요소를 제거한 새 배열을 반환합니다.
 */
export const removeLastMember = (list) => {
  if (list.length === 0) return list;
  return list.slice(0, -1);
};