import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JournalInput, TaxClass } from "@schemas";
import type { z } from "zod";
import { ActionBus } from "@core/action-bus";
import { callEndpoint } from "@data";
type JI = z.infer<typeof JournalInput>;

type Props = {
  initial?: Partial<JI>;
  suggestTax?: boolean;
  className?: string;
  nodeId?: string;
};

export const JournalForm: FC<Props> = ({ initial, suggestTax = false, className, nodeId }) => {
  const { register, handleSubmit, formState, setError, setValue, watch } = useForm<JI>({
    resolver: zodResolver(JournalInput),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      debitAccount: "",
      creditAccount: "",
      amount: 0,
      taxClass: "課税",
      note: "",
      evidenceId: "",
      ...(initial as any),
    },
    mode: "onChange",
  });

  // 任意：金額や勘定が変わったらDMNで税区分提案
  const amount = watch("amount");
  const debit = watch("debitAccount");
  const credit = watch("creditAccount");

  async function maybeSuggest() {
    if (!suggestTax) return;
    try {
      const input = { amount, debit, credit };
      const res = await callEndpoint("dmn.run", { params: { key: "consumption-tax" }, body: input });
      const t = (res.result?.taxClass ?? "") as string;
      if (TaxClass.options.includes(t as any)) {
        // 軽いUI：採用ボタン／破棄ボタンをトースト代わりにconsoleで
        console.log("[suggestion] taxClass:", t);
        setValue("taxClass", t as any, { shouldValidate: true });
      }
    } catch {
      /* noop */
    }
  }

  const onSubmit = async (data: JI) => {
    // 事前検証（冪等だがユーザ体験向上）
    const v = await callEndpoint("journal.validate", { body: data }).catch(async (e) => {
      setError("root.server", { message: "Validation failed" });
      throw e;
    });
    if (!v.ok) {
      setError("root.server", { message: v.issues.join("; ") });
      return;
    }
    // 保存
    try {
      const res = await callEndpoint("journal.save", { body: data });
      if (res.ok && res.id) {
        ActionBus.emit({ type: "COMPONENT_EVENT", nodeId, event: "onSaved", payload: { journalId: res.id } });
        console.log("[toast:success] 保存しました");
      } else {
        setError("root.server", { message: res.message ?? "保存に失敗しました" });
      }
    } catch (err: any) {
      setError("root.server", { message: String(err?.message ?? "保存に失敗") });
    }
  };

  return (
    <form className={`p-4 space-y-3 ${className ?? ""}`} onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-gray-500">日付</span>
          <input type="date" className="w-full border rounded px-2 py-1" {...register("date")} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-gray-500">金額</span>
          <input type="number" className="w-full border rounded px-2 py-1" {...register("amount", { valueAsNumber: true })} onBlur={maybeSuggest} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-gray-500">借方勘定</span>
          <input className="w-full border rounded px-2 py-1" {...register("debitAccount")} onBlur={maybeSuggest} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-gray-500">貸方勘定</span>
          <input className="w-full border rounded px-2 py-1" {...register("creditAccount")} onBlur={maybeSuggest} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-gray-500">税区分</span>
          <select className="w-full border rounded px-2 py-1" {...register("taxClass")}>
            {TaxClass.options.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-gray-500">証憑ID</span>
          <input className="w-full border rounded px-2 py-1" {...register("evidenceId")} />
        </label>
        <label className="col-span-2 space-y-1">
          <span className="text-xs text-gray-500">摘要</span>
          <input className="w-full border rounded px-2 py-1" {...register("note")} />
        </label>
      </div>

      {formState.errors.root?.server && (
        <div className="text-red-600 text-sm">{formState.errors.root.server.message}</div>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" disabled={!formState.isValid}>
          保存
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded border"
          onClick={() => ActionBus.emit({ type: "COMPONENT_EVENT", nodeId, event: "onCancel", payload: {} })}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};
