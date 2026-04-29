export default function PageHeader({ title = "", subtitle = "", right = null }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {right && (
        <div>
          {right}
        </div>
      )}

    </div>
  );
}