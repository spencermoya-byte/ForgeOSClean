type ExtensionCardProps = {
  extension: any;
};

const ExtensionCard = ({ extension }: ExtensionCardProps) => {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h3 className="text-lg font-semibold text-white">
        {extension?.name || "Untitled Extension"}
      </h3>
      <p className="text-sm text-gray-400">
        {extension?.description || "No description available."}
      </p>
    </div>
  );
};

export default ExtensionCard;
