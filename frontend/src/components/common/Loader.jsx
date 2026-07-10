const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-100 border-t-orange-500" />
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);

export default Loader;
