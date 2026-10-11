// Recupera todas as páginas; uma falha interrompe a leitura, nunca retorna dados parciais.
export const DATA_PAGE_SIZE = 500;

export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{
    data: T[] | null;
    error: unknown;
  }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += DATA_PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + DATA_PAGE_SIZE - 1);
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < DATA_PAGE_SIZE) return rows;
  }
}