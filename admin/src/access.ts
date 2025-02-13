export default function access() {
  const token = localStorage.getItem('token');
  
  return {
    isUser: !!token,
    canAdmin: !!token,  // 这里可以根据用户角色进行更细粒度的控制
  };
}
