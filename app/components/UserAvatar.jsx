export default function UserAvatar({ user }) {
  return (
    <div className="avatar">
      <img src={user?.image} alt={user?.name} />
      <span>
        <p>
          {user?.name} {user?.lastname}
        </p>
      </span>
    </div>
  );
}
