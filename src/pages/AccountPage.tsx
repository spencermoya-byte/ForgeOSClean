type AccountPageProps = {
  onAction: (
    label: string
  ) => void;
};

export function AccountPage({
  onAction,
}: AccountPageProps) {
  return (
    <main className="simple-page">
      <div className="account-shell">
        <div className="avatar">
          SM
        </div>

        <h1>
          Spencer Moya
        </h1>

        <p>
          @smgunner14
        </p>

        <p>
          smgunner14@gmail.com
        </p>

        <div className="account-section">
          {[
            "Profile",
            "Theme - Dark",
            "Usage",
            "Notifications",
            "Help",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className="account-row"
              onClick={() =>
                onAction(item)
              }
            >
              <span>{item}</span>
              <em>›</em>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
